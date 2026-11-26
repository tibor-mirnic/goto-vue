import { computed, useId } from 'vue';
import { isPaletteName } from '../../../api/palette.models.ts';
import { usePaletteSsrViewer } from '../paletteViewer.provider.ts';

export const usePaletteSsrPicker = () => {
  const { palettes, state, select } = usePaletteSsrViewer();
  const selectId = `pe-palette-ssr-select-${useId()}`;
  const selectedPalette = computed({
    get: () => state.value.palette,
    set: (palette: string) => {
      if (isPaletteName(palette) && palette !== state.value.palette) select(palette);
    }
  });

  return { palettes, selectedPalette, selectId };
};
