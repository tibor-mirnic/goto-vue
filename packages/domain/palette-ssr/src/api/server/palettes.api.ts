import { type PaletteName, type PaletteResult, isPaletteName } from '../palette.models.ts';

export type PaletteSource = (palette: PaletteName) => readonly string[] | Promise<readonly string[]>;

export const getPalette = async (palette: unknown, readColors: PaletteSource): Promise<PaletteResult> => {
  if (!isPaletteName(palette)) throw new RangeError('Unsupported palette name');

  const colors = await readColors(palette);
  return { palette, colors: [...colors] };
};
