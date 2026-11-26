import type { PaletteName } from '../palette.models.ts';

const fixtureColors = {
  aurora: Object.freeze(['indigo', 'harbor blue']),
  mist: Object.freeze([])
} satisfies Record<PaletteName, readonly string[]>;

export const readFixturePaletteColors = (palette: PaletteName): readonly string[] => fixtureColors[palette];
