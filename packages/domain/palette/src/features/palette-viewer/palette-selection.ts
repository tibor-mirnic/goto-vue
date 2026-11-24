import type { PaletteColors } from '../../api/palettes/palette-colors.ts';
import { type PaletteGetJson, getPaletteColors } from '../../api/palettes/palettes.api.ts';

export type PaletteState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly palette: string }
  | { readonly status: 'ready'; readonly palette: string; readonly colors: PaletteColors }
  | { readonly status: 'error'; readonly palette: string };

export const createPaletteSelection = (getJson: PaletteGetJson, onStateChange: (state: PaletteState) => void) => {
  let active: AbortController | undefined;
  let selected: string | undefined;
  let disposed = false;
  onStateChange({ status: 'idle' });

  const select = async (palette: string): Promise<void> => {
    if (disposed) return;
    const previous = active;
    const request = new AbortController();
    active = request;
    selected = palette;
    previous?.abort();
    if (request.signal.aborted) return;

    onStateChange({ status: 'loading', palette });
    if (request.signal.aborted) return;

    let result: PaletteState;
    try {
      const colors = await getPaletteColors(getJson, palette, request.signal);
      result = { status: 'ready', palette, colors };
    } catch {
      result = { status: 'error', palette };
    }
    if (request.signal.aborted) return;
    active = undefined;
    onStateChange(result);
  };

  const retry = async (): Promise<void> => {
    if (selected !== undefined) await select(selected);
  };

  const dispose = (): void => {
    disposed = true;
    active?.abort();
    active = undefined;
  };

  return { select, retry, dispose };
};
