export type PaletteColors = readonly string[];

export const parsePaletteColors = (value: unknown): PaletteColors => {
  if (!Array.isArray(value)) throw new TypeError('Expected an array of color names');

  const colors: string[] = [];
  for (const color of value) {
    if (typeof color !== 'string' || color.trim() === '') throw new TypeError('Expected a nonblank color name');
    colors.push(color);
  }
  return colors;
};
