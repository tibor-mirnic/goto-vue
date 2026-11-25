import { compileString } from 'sass';
import { expect, test } from 'vite-plus/test';

import manifest from '../package.json' with { type: 'json' };

const entry = manifest.exports['./styles.scss'].sass;
const compile = (source = '') =>
  compileString(`@use '${entry}' as ui; ${source}`, { url: new URL('../package.json', import.meta.url) }).css;

test('loading the public definitions emits no CSS', () => {
  expect(compile()).toBe('');
});

test('the theme preserves the viewer spacing and inherits its text color', () => {
  const css = compile('.example { @include ui.theme; }');
  expect(css).toContain('--goto-ui-label-gap: 0.25rem;');
  expect(css).toContain('--goto-ui-list-indent: 1.5rem;');
  expect(css).toContain('--goto-ui-text-color: currentColor;');
});

test('themes accept individual overrides and the palette can be included alone', () => {
  const css = compile('.example { @include ui.theme($label-gap: 1rem, $text-color: teal); }');
  expect(css).toContain('--goto-ui-label-gap: 1rem;');
  expect(css).toContain('--goto-ui-text-color: teal;');
  expect(css).toContain('--goto-ui-list-indent: 1.5rem;');
  const palette = compile('.example { @include ui.palette(indigo); }');
  expect(palette).toContain('--goto-ui-text-color: indigo;');
  expect(palette).not.toContain('--goto-ui-label-gap');
});

test('the theme loader resolves semantic colors and spacing from the supplied maps', () => {
  const css = compile(`
    .example {
      @include ui.load-goto-ui-theme((text: ink), (spacing: (label-gap: 1rem, list-indent: 2rem)), (ink: teal));
    }
  `);
  expect(css).toContain('--goto-ui-text-color: teal;');
  expect(css).toContain('--goto-ui-label-gap: 1rem;');
  expect(css).toContain('--goto-ui-list-indent: 2rem;');
});
