# @goto/infrastructure-ui

Load the public Sass entry in a Vite stylesheet and include the theme inside the selector that owns the controls.

```scss
@use '@goto/infrastructure-ui/styles.scss' as ui;

.controls {
  @include ui.theme($label-gap: 0.5rem);
}

.controls__label {
  color: var(--goto-ui-text-color);
  gap: var(--goto-ui-label-gap);
}
```

Loading the entry alone emits no CSS. The theme declares custom properties for label spacing (`0.25rem`), list indentation (`1.5rem`) and text color (`currentColor`). Override any of them with the corresponding named mixin argument, `$label-gap`, `$list-indent` or `$text-color`. The public `ui.$palette` map holds the default `text` color. To set only the color, include `ui.palette($text-color: teal)`.

The package ships its Sass sources directly. In Dart Sass with the Node package importer, use `@use 'pkg:@goto/infrastructure-ui/styles.scss' as ui`.

## Sass layout

- `src/scss/_index.scss` exposes the public variables, mixins and theme loaders through the package entry.
- `public/variables/_colors.scss` defines the raw `$color-palette` and the light theme’s text role in `$theme-light`. `public/variables/_variables.scss` groups spacing in `$goto-ui-variables`. The `_index.scss` files collect each group.
- `public/mixins/_palette.scss` emits the text color declaration.
- `theme/_goto-ui-theme.scss` composes the declarations from a semantic theme, UI variables and color palette. Pass these three maps to `ui.load-goto-ui-theme` to supply a complete theme. `theme/light.scss` supplies the default maps and named overrides through `ui.theme`.
