import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import PaletteModule from '../PaletteModule.vue';

test('mounts the palette page with no host inputs or initial request', async () => {
  const request = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', request);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });

  const html = await renderToString(h(PaletteModule));
  expect(html).toContain('<main class="pe-palette-page">');
  expect(html).toContain('<h1>Palettes</h1>');
  expect(html).toMatch(
    /<label[^>]*>.*?Palette.*?<select[^>]*>.*?<option value(?:="")? disabled selected>Choose a palette/
  );
  expect(request).not.toHaveBeenCalled();
});
