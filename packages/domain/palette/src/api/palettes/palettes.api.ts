import { type PaletteColors, parsePaletteColors } from './palette-colors.ts';

export type PaletteGetJson = (
  path: string,
  options: { parse: typeof parsePaletteColors; signal: AbortSignal }
) => Promise<PaletteColors>;

export const getPaletteColors = (
  getJson: PaletteGetJson,
  palette: string,
  signal: AbortSignal
): Promise<PaletteColors> =>
  getJson(`/palettes/${encodeURIComponent(palette)}.json`, { parse: parsePaletteColors, signal });
