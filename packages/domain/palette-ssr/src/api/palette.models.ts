export const paletteNames = ['aurora', 'mist'] as const;

export type PaletteName = (typeof paletteNames)[number];

export type PaletteResult = {
  readonly palette: PaletteName;
  readonly colors: readonly string[];
};

export const isPaletteName = (value: unknown): value is PaletteName =>
  paletteNames.some((palette) => palette === value);
