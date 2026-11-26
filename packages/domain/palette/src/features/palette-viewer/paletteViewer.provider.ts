import { type InjectionKey, inject, onScopeDispose, provide, shallowRef } from 'vue';
import { getPaletteColors } from '../../api/index.ts';
import { createPaletteSelection } from './paletteSelection.util.ts';
import type { PaletteState } from './paletteViewer.models.ts';

const key: InjectionKey<ReturnType<typeof providePaletteViewer>> = Symbol('palette viewer');

const palettes = ['aurora', 'mist'] as const;

export const providePaletteViewer = () => {
  const state = shallowRef<PaletteState>({ status: 'idle' });
  const { select, retry, dispose } = createPaletteSelection(getPaletteColors, (next) => {
    state.value = next;
  });
  onScopeDispose(dispose);
  const viewer = { state, select, retry, palettes };
  provide(key, viewer);
  return viewer;
};

export const usePaletteViewer = () => {
  const viewer = inject(key);
  if (!viewer) throw new Error('PePaletteViewer requires providePaletteViewer');
  return viewer;
};
