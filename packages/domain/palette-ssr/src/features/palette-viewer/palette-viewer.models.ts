import type { ExtractPublicPropTypes, PropType } from 'vue';
import { type PaletteName, type PaletteResult, isPaletteName } from '../../api/palettes/palettes.api.models.ts';

export const paletteViewerProps = {
  selectedPalette: { type: String as PropType<PaletteName>, required: true },
  status: { type: String as PropType<'pending' | 'ready' | 'error'>, required: true },
  result: { type: Object as PropType<PaletteResult | null> }
} as const;

export type PaletteViewerProps = ExtractPublicPropTypes<typeof paletteViewerProps>;

export const paletteViewerEmits = {
  select: (palette: PaletteName) => isPaletteName(palette),
  retry: () => true
};
