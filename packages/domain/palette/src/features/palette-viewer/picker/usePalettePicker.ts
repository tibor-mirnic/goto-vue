import { computed } from 'vue';
import { usePaletteViewer } from '../paletteViewer.provider.ts';

export const usePalettePicker = () => {
  const { palettes, state, select } = usePaletteViewer();
  const selectedPalette = computed({
    get: () => (state.value.status === 'idle' ? '' : state.value.palette),
    set: (palette: string) => {
      void select(palette);
    }
  });

  return { palettes, selectedPalette };
};
