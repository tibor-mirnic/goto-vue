import { expect, test, vi } from 'vite-plus/test';
import { type PaletteState, createPaletteSelection } from '../palette-selection.util.ts';

const setup = () => {
  const states: PaletteState[] = [];
  const requests: {
    name: string;
    signal: AbortSignal;
    respond: (colors: readonly string[]) => void;
    reject: (error: Error) => void;
  }[] = [];
  const loadColors = (name: string, signal: AbortSignal) =>
    new Promise<readonly string[]>((respond, reject) => requests.push({ name, signal, respond, reject }));
  const selection = createPaletteSelection(loadColors, (state) => states.push(state));
  return { states, requests, selection };
};

test('selects a palette, reports loading immediately and publishes the loaded colors', async () => {
  const { states, requests, selection } = setup();
  await selection.retry();
  const load = selection.select('aurora');
  expect(requests).toHaveLength(1);
  expect(states).toEqual([{ status: 'idle' }, { status: 'loading', palette: 'aurora' }]);
  requests[0].respond(['indigo', 'harbor blue']);
  await load;
  expect(states.at(-1)).toEqual({ status: 'ready', palette: 'aurora', colors: ['indigo', 'harbor blue'] });
});

test('recovers from a failed load by requesting the same palette again', async () => {
  const { states, requests, selection } = setup();
  const load = selection.select('aurora');
  requests[0].reject(new Error('Palette unavailable'));
  await load;
  const retry = selection.retry();
  expect(requests[1].name).toBe(requests[0].name);
  expect(requests[1].signal).not.toBe(requests[0].signal);
  requests[1].respond(['teal']);
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
  requests[1].respond(['silver']);
  await second;
  expect(states).toHaveLength(4);
  expect(states.at(-1)).toEqual({ status: 'loading', palette: 'mist' });
  const fourth = selection.retry();
  expect(requests[2].signal.aborted).toBe(true);
  requests[3].respond(['teal']);
  await fourth;
  requests[0].reject(new Error('late network failure'));
  requests[2].respond(['silver']);
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
  const loadColors = vi.fn<() => Promise<readonly string[]>>();
  const selection = createPaletteSelection(loadColors, (state) => {
    if (state.status === 'loading') selection.dispose();
  });
  await selection.select('aurora');
  expect(loadColors).not.toHaveBeenCalled();
});

test('honors disposal from a superseded request’s abort listener', async () => {
  const { states, requests, selection } = setup();
  const first = selection.select('aurora');
  requests[0].signal.addEventListener('abort', selection.dispose);
  await selection.select('mist');
  requests[0].respond(['indigo']);
  await first;
  expect(requests).toHaveLength(1);
  expect(states).toEqual([{ status: 'idle' }, { status: 'loading', palette: 'aurora' }]);
});
