import { expect, test } from 'vite-plus/test';
import { h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import PePalettePage from '../PePalettePage.vue';

test('provides the feature palettes when the page renders on its own', async () => {
  const html = await renderToString(h(PePalettePage));
  expect(html).toMatch(/<option value="aurora"[^>]*>aurora<\/option>/);
  expect(html).toMatch(/<option value="mist"[^>]*>mist<\/option>/);
});
