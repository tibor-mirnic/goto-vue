import { expect, test, vi } from 'vite-plus/test';
import { readFixturePaletteColors } from '../palette-fixture.source.ts';
import { getPalette } from '../palettes.api.ts';

test('returns the ordered Aurora colors in a serializable result', async () => {
  const result = await getPalette('aurora', readFixturePaletteColors);

  expect(result).toEqual({ palette: 'aurora', colors: ['indigo', 'harbor blue'] });
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
});

test('returns a defined result for Mist with no colors', async () => {
  await expect(getPalette('mist', readFixturePaletteColors)).resolves.toEqual({ palette: 'mist', colors: [] });
});

test.each(['unsupported', '__proto__', undefined])('rejects %s before reading from the source', async (palette) => {
  const readColors = vi.fn(() => []);

  await expect(getPalette(palette, readColors)).rejects.toThrow(RangeError);
  expect(readColors).not.toHaveBeenCalled();
});

test('returns a snapshot of the colors from an asynchronous source', async () => {
  const colors = ['indigo'];
  const readColors = async () => colors;

  const first = await getPalette('aurora', readColors);
  colors.push('harbor blue');

  expect(first.colors).toEqual(['indigo']);
  await expect(getPalette('aurora', readColors)).resolves.toEqual({
    palette: 'aurora',
    colors: ['indigo', 'harbor blue']
  });
});
