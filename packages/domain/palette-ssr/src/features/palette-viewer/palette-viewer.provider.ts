import { type InjectionKey, computed, inject, provide } from 'vue';
import { type PaletteName, paletteNames } from '../../api/palettes/palettes.api.models.ts';
import type { PaletteViewerProps } from './palette-viewer.models.ts';

const key: InjectionKey<ReturnType<typeof providePaletteSsrViewer>> = Symbol('SSR palette viewer');

export const providePaletteSsrViewer = (
  props: PaletteViewerProps,
  select: (palette: PaletteName) => void,
  retry: () => void
) => {
  const state = computed(() => {
    const { selectedPalette: palette, status, result } = props;
    if (status === 'error') return { status, palette } as const;
    if (status === 'ready' && result?.palette === palette) return { status, palette, colors: result.colors } as const;
    return { status: 'pending', palette } as const;
  });

  const viewer = { state, select, retry, palettes: paletteNames };
  provide(key, viewer);
  return viewer;
};

export const usePaletteSsrViewer = () => {
  const viewer = inject(key);
  if (!viewer) throw new Error('PePaletteSsrViewer requires providePaletteSsrViewer');
  return viewer;
};
