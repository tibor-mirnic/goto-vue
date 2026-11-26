import { createHttpClient } from '@goto/infrastructure-http-client';
import { parsePaletteColors } from './paletteColors.models.ts';

const { getJson } = createHttpClient((path, init) => fetch(path, init));

export const getPaletteColors = (palette: string, signal: AbortSignal) =>
  getJson(`/palettes/${encodeURIComponent(palette)}.json`, { parse: parsePaletteColors, signal });
