import { computed, useId } from 'vue';
import { isPaletteName } from '../../../api/palette.models.ts';
import { usePaletteSsrViewer } from '../palette-viewer.provider.ts';

export const usePaletteSsrViewerControls = () => {
  const { palettes, state, select, retry } = usePaletteSsrViewer();
  const selectId = `pe-palette-ssr-select-${useId()}`;
  const selectedPalette = computed({
    get: () => state.value.palette,
    set: (palette: string) => {
      if (isPaletteName(palette) && palette !== state.value.palette) select(palette);
    }
  });

  return { palettes, state, selectedPalette, selectId, retry };
};
