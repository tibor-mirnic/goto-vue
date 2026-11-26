import { type PaletteResult, type PaletteSource, isPaletteName } from './palettes.api.models.ts';

export const getPalette = async (palette: unknown, readColors: PaletteSource): Promise<PaletteResult> => {
  if (!isPaletteName(palette)) throw new RangeError('Unsupported palette name');

  const colors = await readColors(palette);
  return { palette, colors: [...colors] };
};
