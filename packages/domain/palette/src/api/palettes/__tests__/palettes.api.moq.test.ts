import { HttpResponse, http } from 'msw/http';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect, test } from 'vite-plus/test';
import { createPaletteHandlers } from '../../../index.moq.ts';
import { readMockPaletteColors } from './paletteColors.moq.ts';

const origin = 'https://palette.example.test';
const aurora = `${origin}/palettes/aurora.json`;
const mist = `${origin}/palettes/mist.json`;
const handlers = createPaletteHandlers(origin);
const server = setupServer(
  ...handlers,
  http.all('*', () => HttpResponse.text('unrelated traffic'))
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('serves the populated and empty palettes as raw JSON arrays', async () => {
  const auroraResponse = await fetch(aurora);
  const mistResponse = await fetch(mist);
  expect(auroraResponse.status).toBe(200);
  expect(mistResponse.status).toBe(200);
  expect(auroraResponse.headers.get('content-type')).toContain('application/json');
  expect(mistResponse.headers.get('content-type')).toContain('application/json');

  const auroraColors = await auroraResponse.json();
  const mistColors = await mistResponse.json();
  expect(auroraColors).toEqual(['coral', 'violet']);
  expect(mistColors).toEqual([]);
  expect(auroraColors).toEqual(readMockPaletteColors('aurora'));
  expect(mistColors).toEqual(readMockPaletteColors('mist'));
});

test('can override Aurora with a temporary failure', async () => {
  server.use(http.get(aurora, () => new HttpResponse(null, { status: 503 })));

  expect((await fetch(aurora)).status).toBe(503);
  expect(await (await fetch(mist)).json()).toEqual([]);
});

test('restores the default response after the override', async () => {
  const response = await fetch(aurora);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(['coral', 'violet']);
});

test.each([
  [`${origin}/palettes/unknown.json`, 'GET'],
  [`${origin}/api/palette-ssr?name=aurora`, 'GET'],
  [`${aurora}/`, 'GET'],
  ['https://other.example.test/palettes/aurora.json', 'GET'],
  [aurora, 'POST']
])('leaves %s (%s) available to other handlers', async (url, method) => {
  expect(await (await fetch(url, { method })).text()).toBe('unrelated traffic');
});

test('creates fresh handlers and returns independent fixture arrays', () => {
  const nextHandlers = createPaletteHandlers(origin);
  expect(nextHandlers).toHaveLength(2);
  expect(nextHandlers[0]).not.toBe(handlers[0]);
  expect(nextHandlers[1]).not.toBe(handlers[1]);
  expect(readMockPaletteColors('aurora')).not.toBe(readMockPaletteColors('aurora'));
});
