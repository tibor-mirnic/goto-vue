import { createHttpClient } from '@goto/infrastructure-http-client';
import { type PaletteResult, isPaletteName } from '../palette.models.ts';

const { getJson } = createHttpClient((path, init) => fetch(path, { ...init, redirect: 'manual' }));

const parsePaletteColors = (value: unknown): readonly string[] => {
  if (!Array.isArray(value) || !value.every((color) => typeof color === 'string' && color.trim() !== '')) {
    throw new TypeError('Expected an array of nonblank color names');
  }

  return value;
};

export const getPalette = async (name: unknown, origin: string): Promise<PaletteResult> => {
  if (!isPaletteName(name)) throw new RangeError('Unsupported palette name');

  const url = new URL(`/api/palettes/${name}`, origin);
  const colors = await getJson(url.href, { parse: parsePaletteColors });
  return { palette: name, colors: [...colors] };
};
