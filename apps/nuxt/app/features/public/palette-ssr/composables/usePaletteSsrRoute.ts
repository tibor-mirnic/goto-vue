import type { PaletteName, PaletteViewerState } from '@goto/domain-palette-ssr';
import { computed, ref } from 'vue';

export const usePaletteSsrRoute = () => {
  const selectedPalette = ref<PaletteName>('aurora');
  const query = useFetch('/api/palette-ssr', {
    key: 'palette-ssr',
    query: { name: selectedPalette },
    // Selection and retry each trigger their own refresh.
    watch: false,
    dedupe: 'cancel',
    retry: 0
  });
  const { data, status, refresh } = query;

  const state = computed<PaletteViewerState>(() => {
    const palette = selectedPalette.value;
    const result = data.value;
    if (status.value === 'error') return { status: 'error', palette };
    if (status.value === 'success' && result?.palette === palette) {
      return { status: 'ready', palette, colors: result.colors };
    }
    return { status: 'pending', palette };
  });

  const retry = () => {
    void refresh();
  };
  const select = (palette: PaletteName) => {
    if (palette === selectedPalette.value) return;
    selectedPalette.value = palette;
    retry();
  };

  return { query, state, select, retry };
};
