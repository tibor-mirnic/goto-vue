import { afterEach, expect, test, vi } from 'vite-plus/test';
import { getPaletteColors } from '../palettes.api.ts';

afterEach(() => vi.unstubAllGlobals());

test('requests the encoded palette asset with the caller signal and decodes its colors', async () => {
  const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(['indigo']));
  vi.stubGlobal('fetch', request);
  const { signal } = new AbortController();
  await expect(getPaletteColors('Aurora / Mist', signal)).resolves.toEqual(['indigo']);
  expect(request).toHaveBeenCalledExactlyOnceWith('/palettes/Aurora%20%2F%20Mist.json', { method: 'GET', signal });
});

test('rejects a malformed palette returned by the HTTP client', async () => {
  vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(['indigo', ' '])));
  await expect(getPaletteColors('mist', new AbortController().signal)).rejects.toThrow(TypeError);
});
