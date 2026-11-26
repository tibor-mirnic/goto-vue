import { type InjectionKey, type Ref, inject, provide } from 'vue';
import { type PaletteName, paletteNames } from '../../api/palette.models.ts';
import type { PaletteViewerState } from './paletteViewer.models.ts';

type PaletteViewer = {
  readonly state: Readonly<Ref<PaletteViewerState>>;
  readonly select: (palette: PaletteName) => void;
  readonly retry: () => void;
};

const key: InjectionKey<PaletteViewer & { readonly palettes: typeof paletteNames }> = Symbol('SSR palette viewer');

export const providePaletteSsrViewer = (viewer: PaletteViewer) => {
  provide(key, { ...viewer, palettes: paletteNames });
};

export const usePaletteSsrViewer = () => {
  const viewer = inject(key);
  if (!viewer) throw new Error('PePaletteSsrViewer requires providePaletteSsrViewer');
  return viewer;
};
