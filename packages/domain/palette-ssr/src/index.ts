import PePaletteSsrPageComponent from './pages/palette-ssr/PePaletteSsrPage.vue';

export type { PaletteName } from './api/palette.models.ts';
export type { PaletteViewerState } from './features/palette-ssr-viewer/paletteViewer.models.ts';

// Infer the public type here so the emitted declaration can resolve in NodeNext.
export const PePaletteSsrPage = PePaletteSsrPageComponent;
