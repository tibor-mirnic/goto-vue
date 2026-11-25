import { computed } from 'vue';
import { usePaletteViewer } from './palette-viewer.provider.ts';

export const usePaletteViewerControls = () => {
  const { palettes, state, select, retry } = usePaletteViewer();
  const selectedPalette = computed({
    get: () => (state.value.status === 'idle' ? '' : state.value.palette),
    set: (palette: string) => {
      void select(palette);
    }
  });

  return { palettes, state, selectedPalette, retry };
};
