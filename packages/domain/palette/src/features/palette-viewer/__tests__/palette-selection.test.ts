import { expect, test, vi } from 'vite-plus/test';
import type { PaletteGetJson } from '../../../api/palettes/palettes.api.ts';
import { type PaletteState, createPaletteSelection } from '../palette-selection.ts';

const setup = () => {
  const states: PaletteState[] = [];
  const requests: {
    path: string;
    signal: AbortSignal;
    respond: (response: Response) => void;
    reject: (error: Error) => void;
  }[] = [];
  const getJson: PaletteGetJson = async (path, { signal, parse }) => {
    const response = await new Promise<Response>((respond, reject) => requests.push({ path, signal, respond, reject }));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parse(await response.json());
  };
  const selection = createPaletteSelection(getJson, (state) => states.push(state));
  return { states, requests, selection };
};

test('selects a palette, reports loading immediately and publishes the decoded colors', async () => {
  const { states, requests, selection } = setup();
  await selection.retry();
  const load = selection.select('aurora');
  expect(requests).toHaveLength(1);
  expect(states).toEqual([{ status: 'idle' }, { status: 'loading', palette: 'aurora' }]);
  requests[0].respond(Response.json(['indigo', 'harbor blue']));
  await load;
  expect(states.at(-1)).toEqual({ status: 'ready', palette: 'aurora', colors: ['indigo', 'harbor blue'] });
});

test('rejects malformed colors through the existing palette decoder', async () => {
  const states: PaletteState[] = [];
  const getJson: PaletteGetJson = async (_path, { parse }) => parse(['indigo', ' ']);
  const selection = createPaletteSelection(getJson, (state) => states.push(state));
  await selection.select('aurora');
  expect(states.at(-1)).toEqual({ status: 'error', palette: 'aurora' });
});

test('recovers from a 503 by requesting the same palette again', async () => {
  const { states, requests, selection } = setup();
  const load = selection.select('aurora');
  requests[0].respond(new Response(null, { status: 503 }));
  await load;
  const retry = selection.retry();
  expect(requests[1].path).toBe(requests[0].path);
  expect(requests[1].signal).not.toBe(requests[0].signal);
  requests[1].respond(Response.json(['teal']));
  await retry;
  expect(states).toEqual([
    { status: 'idle' },
    { status: 'loading', palette: 'aurora' },
    { status: 'error', palette: 'aurora' },
    { status: 'loading', palette: 'aurora' },
    { status: 'ready', palette: 'aurora', colors: ['teal'] }
  ]);
});

test('ignores superseded results and keeps the latest retry cancellable', async () => {
  const { states, requests, selection } = setup();
  const first = selection.select('aurora');
  const second = selection.select('mist');
  const third = selection.retry();
  expect(requests.map(({ signal }) => signal.aborted)).toEqual([true, true, false]);
  requests[1].respond(Response.json(['silver']));
  await second;
  expect(states).toHaveLength(4);
  expect(states.at(-1)).toEqual({ status: 'loading', palette: 'mist' });
  const fourth = selection.retry();
  expect(requests[2].signal.aborted).toBe(true);
  requests[3].respond(Response.json(['teal']));
  await fourth;
  requests[0].reject(new Error('late network failure'));
  requests[2].respond(Response.json(['silver']));
  await Promise.all([first, third]);
  expect(states).toHaveLength(6);
  expect(states.at(-1)).toEqual({ status: 'ready', palette: 'mist', colors: ['teal'] });
});

test('disposes quietly and suppresses subsequent selections and retries', async () => {
  const { states, requests, selection } = setup();
  const load = selection.select('aurora');
  requests[0].signal.addEventListener('abort', () => requests[0].reject(new Error('cancelled')));
  selection.dispose();
  selection.dispose();
  await Promise.all([load, selection.select('mist'), selection.retry()]);
  expect(requests).toHaveLength(1);
  expect(requests[0].signal.aborted).toBe(true);
  expect(states).toEqual([{ status: 'idle' }, { status: 'loading', palette: 'aurora' }]);
});

test('honors disposal from a loading callback before starting transport', async () => {
  const getJson = vi.fn<PaletteGetJson>();
  const selection = createPaletteSelection(getJson, (state) => {
    if (state.status === 'loading') selection.dispose();
  });
  await selection.select('aurora');
  expect(getJson).not.toHaveBeenCalled();
});

test('honors disposal from a superseded request’s abort listener', async () => {
  const { states, requests, selection } = setup();
  const first = selection.select('aurora');
  requests[0].signal.addEventListener('abort', selection.dispose);
  await selection.select('mist');
  requests[0].respond(Response.json(['indigo']));
  await first;
  expect(requests).toHaveLength(1);
  expect(states).toEqual([{ status: 'idle' }, { status: 'loading', palette: 'aurora' }]);
});
