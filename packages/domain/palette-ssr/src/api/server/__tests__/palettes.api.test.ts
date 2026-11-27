import { afterEach, expect, test, vi } from 'vite-plus/test';
import { getPalette } from '../index.ts';

const origin = 'https://palette.example.test';

afterEach(() => vi.unstubAllGlobals());

test('reads an absolute palette URL with the current fetch and returns ordered, serializable colors', async () => {
  const fetchPalette = vi.fn(async () => Response.json(['indigo', 'harbor blue']));
  vi.stubGlobal('fetch', fetchPalette);

  const result = await getPalette('aurora', origin);

  expect(result).toEqual({ palette: 'aurora', colors: ['indigo', 'harbor blue'] });
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  expect(fetchPalette).toHaveBeenCalledExactlyOnceWith(`${origin}/api/palettes/aurora`, {
    method: 'GET',
    redirect: 'manual',
    signal: undefined
  });
});

test('accepts an empty upstream palette', async () => {
  vi.stubGlobal('fetch', async () => Response.json([]));

  await expect(getPalette('mist', origin)).resolves.toEqual({ palette: 'mist', colors: [] });
});

test.each(['unsupported', '__proto__', undefined])('rejects %s before making an HTTP request', async (name) => {
  const fetchPalette = vi.fn();
  vi.stubGlobal('fetch', fetchPalette);

  await expect(getPalette(name, origin)).rejects.toThrow(RangeError);
  expect(fetchPalette).not.toHaveBeenCalled();
});

test('returns a snapshot of the decoded colors', async () => {
  const colors = ['indigo'];
  const response = new Response();
  vi.spyOn(response, 'json').mockResolvedValue(colors);
  vi.stubGlobal('fetch', async () => response);

  const result = await getPalette('aurora', origin);
  colors.push('harbor blue');

  expect(result.colors).toEqual(['indigo']);
});

test.each([{ value: { colors: [] } }, { value: ['indigo', 12] }, { value: ['  '] }])(
  'rejects an invalid color array $value',
  async ({ value }) => {
    vi.stubGlobal('fetch', async () => Response.json(value));

    await expect(getPalette('aurora', origin)).rejects.toThrow(TypeError);
  }
);

test('rejects an unsuccessful upstream response', async () => {
  vi.stubGlobal('fetch', async () => new Response(null, { status: 503 }));

  await expect(getPalette('aurora', origin)).rejects.toMatchObject({ status: 503 });
});
