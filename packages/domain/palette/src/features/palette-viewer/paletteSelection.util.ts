import type { PaletteColors } from '../../api/index.ts';
import type { PaletteState } from './paletteViewer.models.ts';

export const createPaletteSelection = (
  loadColors: (palette: string, signal: AbortSignal) => Promise<PaletteColors>,
  onStateChange: (state: PaletteState) => void
) => {
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
      const colors = await loadColors(palette, request.signal);
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
