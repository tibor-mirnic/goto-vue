import { computed } from 'vue';
import { usePaletteSsrViewer } from '../paletteViewer.provider.ts';

export const usePaletteSsrStatus = () => {
  const { state } = usePaletteSsrViewer();
  const statusMessage = computed(() => {
    const current = state.value;
    if (current.status === 'pending') return `Loading ${current.palette}…`;
    if (current.status === 'error') return `Could not load ${current.palette}.`;
    return current.colors.length ? `Colors in ${current.palette}` : `No colors in ${current.palette}`;
  });

  return { statusMessage };
};
