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

test('both schemes use the same mixin and resolve their own semantic colors', () => {
  const light = compile('.example { @include ui.theme($scheme: light); }');
  expect(light).toContain('--goto-ui-color-scheme: light;');
  expect(light).toContain('--goto-ui-accent-color: #4455cf;');
  const dark = compile('.example { @include ui.theme($scheme: dark); }');
  expect(dark).toContain('--goto-ui-color-scheme: dark;');
  expect(dark).toContain('--goto-ui-text-color: #f4f6fc;');
  expect(dark).toContain('--goto-ui-accent-color: #a9baff;');
  expect(() => compile('.example { @include ui.theme($scheme: dusk); }')).toThrow(/Unknown UI color scheme/);
});

test('scoped themes accept existing positional overrides and custom color maps', () => {
  const css = compile(`
    .example {
      @include ui.theme(1rem, 2rem, ivory, $scheme: dark, $roles: (accent: ink), $color-palette: (ink: teal));
    }
  `);
  expect(css).toContain('--goto-ui-text-color: ivory;');
  expect(css).toContain('--goto-ui-on-surface-color: #f4f6fc;');
  expect(css).toContain('--goto-ui-accent-color: teal;');
  expect(css).toContain('--goto-ui-label-gap: 1rem;');
  expect(css).toContain('--goto-ui-list-indent: 2rem;');
});

test('the standalone stylesheet loader emits each component once and scopes token defaults', () => {
  const css = compile('@include ui.load-goto-ui-styles;');
  expect(css).toMatch(/\*,\s*\*::before,\s*\*::after\s*\{\s*box-sizing: border-box;/);
  expect(css.match(/box-sizing:/g)).toHaveLength(1);
  expect(css.match(/\.goto-ui-button \{/g)).toHaveLength(1);
  expect(css.match(/\.goto-ui-label \{/g)).toHaveLength(1);
  expect(css.match(/\.goto-ui-select \{/g)).toHaveLength(1);
  expect(css.match(/\.goto-ui-ul \{/g)).toHaveLength(1);
  expect(css).toContain('background-color: var(--goto-ui-accent-color, #4455cf)');
  expect(css).toContain('background-color: var(--goto-ui-surface-color, #fff)');
  expect(css).toContain('.goto-ui-button:focus-visible');
  expect(css).toContain('.goto-ui-select:disabled');
  expect(css).toContain('.goto-ui-ul > li::marker');
  expect(css).toContain('padding-inline-start: var(--goto-ui-list-indent, 1.5rem)');
  expect(css).toContain('gap: var(--goto-ui-label-gap, 0.25rem)');
  expect(compile('.surface { @include ui.theme; }')).not.toContain('.goto-ui-button');
});

test('the packaged defaults follow the OS and support explicit light and dark containers', () => {
  const css = compile('@include ui.load-goto-ui-styles;');
  expect(css).toMatch(/:where\(:root, \[data-goto-ui-theme=light\]\)\s*\{[^}]*--goto-ui-color-scheme: light;/);
  expect(css).toMatch(
    /@media \(prefers-color-scheme: dark\)\s*\{\s*:where\(:root:not\(\[data-goto-ui-theme=light\]\)\)\s*\{[^}]*--goto-ui-color-scheme: dark;/
  );
  expect(css).toMatch(/:where\(\[data-goto-ui-theme=dark\]\)\s*\{[^}]*--goto-ui-accent-color: #a9baff;/);
});

test('stylesheet overrides reach control dimensions, scoped defaults and component fallbacks', () => {
  const css = compile(`
    @include ui.load-goto-ui-styles(
      $variables: (control: (min-height: 3rem), spacing: (label-gap: 1rem)),
      $light-roles: (accent: leaf),
      $dark-roles: (accent: mint),
      $color-palette: (leaf: #246153, mint: #a3e4d2)
    );
  `);
  expect(css).toMatch(/\.goto-ui-button \{[^}]*min-height: 3rem;[^}]*border-radius: 0.5rem;/);
  expect(css).toMatch(/\.goto-ui-select \{[^}]*min-height: 3rem;/);
  expect(css).toMatch(/\.goto-ui-button \{[^}]*background-color: var\(--goto-ui-accent-color, #246153\);/);
  expect(css).toMatch(/\.goto-ui-label \{[^}]*gap: var\(--goto-ui-label-gap, 1rem\);/);
  expect(css).toMatch(/:where\(:root, \[data-goto-ui-theme=light\]\)\s*\{[^}]*--goto-ui-accent-color: #246153;/);
  expect(css).toMatch(/@media \(prefers-color-scheme: dark\)[^{]*\{\s*[^{}]+\{[^}]*--goto-ui-accent-color: #a3e4d2;/);
  expect(css).toMatch(/:where\(\[data-goto-ui-theme=dark\]\)\s*\{[^}]*--goto-ui-accent-color: #a3e4d2;/);
  expect(css.match(/--goto-ui-label-gap: 1rem;/g)).toHaveLength(3);
});
