import type { PaletteColors } from '../../api/index.ts';

export type PaletteState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly palette: string }
  | { readonly status: 'ready'; readonly palette: string; readonly colors: PaletteColors }
  | { readonly status: 'error'; readonly palette: string };
