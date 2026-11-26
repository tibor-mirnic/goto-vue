export type MockPaletteName = 'aurora' | 'mist';

const fixtures: Readonly<Record<MockPaletteName, readonly string[]>> = {
  aurora: ['coral', 'violet'],
  mist: []
};

export const readMockPaletteColors = (palette: MockPaletteName): readonly string[] => [...fixtures[palette]];
