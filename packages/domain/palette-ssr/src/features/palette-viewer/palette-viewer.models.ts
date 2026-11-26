import type { PaletteName } from '../../api/palette.models.ts';

export type PaletteViewerState =
  | { readonly status: 'pending'; readonly palette: PaletteName }
  | { readonly status: 'error'; readonly palette: PaletteName }
  | { readonly status: 'ready'; readonly palette: PaletteName; readonly colors: readonly string[] };
