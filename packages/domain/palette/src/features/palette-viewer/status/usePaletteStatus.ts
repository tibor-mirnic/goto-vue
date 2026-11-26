import { computed } from 'vue';
import { usePaletteViewer } from '../paletteViewer.provider.ts';

export const usePaletteStatus = () => {
  const { state } = usePaletteViewer();
  const statusMessage = computed(() => {
    const current = state.value;
    if (current.status === 'idle') return '';
    if (current.status === 'loading') return `Loading ${current.palette}…`;
    if (current.status === 'error') return `Could not load ${current.palette}.`;
    return current.colors.length ? `Colors in ${current.palette}` : `No colors in ${current.palette}`;
  });

  return { statusMessage };
};
