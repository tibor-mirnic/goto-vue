import { expect, test, vi } from 'vite-plus/test';
import { parsePaletteColors } from '../palette-colors.ts';
import { type PaletteGetJson, getPaletteColors } from '../palettes.api.ts';

test('requests the encoded palette asset with the palette decoder and caller signal', async () => {
  const getJson = vi.fn<PaletteGetJson>().mockResolvedValue(['indigo']);
  const { signal } = new AbortController();
  await expect(getPaletteColors(getJson, 'Aurora / Mist', signal)).resolves.toEqual(['indigo']);
  expect(getJson).toHaveBeenCalledExactlyOnceWith('/palettes/Aurora%20%2F%20Mist.json', {
    parse: parsePaletteColors,
    signal
  });
});
