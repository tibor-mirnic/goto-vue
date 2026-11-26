import { getPalette, isPaletteName, readFixturePaletteColors } from '@goto/domain-palette-ssr/server';

export default defineEventHandler((event) => {
  const { name } = getQuery(event);
  if (!isPaletteName(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected exactly one supported palette name' });
  }

  return getPalette(name, readFixturePaletteColors);
});
