import { afterEach, expect, onTestFinished, test, vi } from 'vite-plus/test';
import { defineComponent, effectScope, h, onServerPrefetch } from 'vue';
import { renderToString } from 'vue/server-renderer';
import PePaletteViewer from '../PePaletteViewer.vue';
import { providePaletteViewer } from '../palette-viewer.provider.ts';

afterEach(() => vi.unstubAllGlobals());

type Viewer = ReturnType<typeof providePaletteViewer>;

const renderViewer = async (
  request: typeof fetch,
  prepare: (viewer: Viewer, stop: () => void) => void | Promise<void>
) => {
  vi.stubGlobal('fetch', request);
  let preparation: Promise<void> | undefined;
  const host = defineComponent({
    setup: () => {
      const scope = effectScope();
      const viewer = scope.run(providePaletteViewer)!;
      onTestFinished(() => scope.stop());
      onServerPrefetch(() => {
        preparation = Promise.resolve().then(() => prepare(viewer, () => scope.stop()));
        return preparation;
      });
      return () => h(PePaletteViewer);
    }
  });
  const html = await renderToString(h(host));
  // Vue handles errors in server-prefetch hooks internally. Propagate fixture errors to Vitest.
  expect(preparation).toBeDefined();
  await preparation;
  return html;
};

test('renders loading, a retry action on failure, and colors after recovery', async () => {
  const pending = vi.fn<typeof fetch>(() => new Promise(() => {}));
  const loading = await renderViewer(pending, ({ select }) => {
    void select('aurora');
  });
  expect(loading).toContain('Loading aurora…');

  const failedRequest = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
  const failed = await renderViewer(failedRequest, ({ select }) => select('aurora'));
  expect(failed).toContain('Could not load aurora.');
  expect(failed).toMatch(/<button type="button"[^>]*>Retry<\/button>/);

  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(Response.json(['teal', 'teal']));
  const ready = await renderViewer(request, async ({ select, retry }) => {
    await select('aurora');
    await retry();
  });
  expect(ready).toContain('Colors in aurora');
  expect(ready.match(/<li[^>]*>teal<\/li>/g)).toHaveLength(2);
  expect(ready).not.toContain('<button');
  expect(request.mock.calls.map(([path]) => path)).toEqual(['/palettes/aurora.json', '/palettes/aurora.json']);
});

test('keeps the latest palette visible when an earlier request finishes late', async () => {
  let finishFirst!: (response: Response) => void;
  const request = vi
    .fn<typeof fetch>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = resolve;
        })
    )
    .mockResolvedValueOnce(Response.json([]));
  const html = await renderViewer(request, async ({ select }) => {
    const first = select('aurora');
    await select('mist');
    expect(request.mock.calls[0][1]?.signal?.aborted).toBe(true);
    finishFirst(Response.json(['obsolete']));
    await first;
  });
  expect(html).toContain('No colors in mist');
  expect(html).not.toContain('obsolete');
});

test('closing the provider scope aborts requests and prevents subsequent retries', async () => {
  const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(['silver']));
  await renderViewer(request, async (viewer, stop) => {
    const pending = viewer.select('mist');
    stop();
    expect(request.mock.calls[0][1]?.signal?.aborted).toBe(true);
    await pending;
    await viewer.retry();
    expect(request).toHaveBeenCalledTimes(1);
    expect(viewer.state.value.status).toBe('loading');
  });
});
