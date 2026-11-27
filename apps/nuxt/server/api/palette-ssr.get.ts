import { getPalette, isPaletteName } from '@goto/domain-palette-ssr/server';
import { paletteApiOrigin } from '../utils/paletteApiOrigin.ts';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (!isPaletteName(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected exactly one supported palette name' });
  }

  try {
    const result = await getPalette(name, paletteApiOrigin);
    return result;
  } catch (cause) {
    throw createError({ statusCode: 502, statusMessage: 'Could not load palette data', cause });
  }
});
