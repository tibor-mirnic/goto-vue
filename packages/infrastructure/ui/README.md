# @goto/infrastructure-ui

Import the controls from the package root and load the default stylesheet once.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { UiButton, UiLabel, UiSelect, UiUl } from '@goto/infrastructure-ui';
import '@goto/infrastructure-ui/style.css';

const choice = ref('');
</script>

<template>
  <form>
    <UiLabel for="size">Size</UiLabel>
    <UiSelect id="size" v-model="choice">
      <option disabled value="">Choose a size</option>
      <option value="small">Small</option>
      <option value="large">Large</option>
    </UiSelect>
    <UiButton type="submit">Save</UiButton>
  </form>
  <UiUl aria-label="Available sizes">
    <li>Small</li>
    <li>Large</li>
  </UiUl>
</template>
```

`UiLabel` renders a native label and accepts a nested control or a `for` attribute. `UiButton` renders a native button with `type="button"` by default. The controls forward attributes, classes and native listeners to their root elements.

`UiSelect` binds a string through `v-model` and takes native options in its default slot. Use an empty string and a disabled option for a placeholder. During server rendering, slotted options retain their own attributes. Hydration applies the bound value to the native select. If the initial HTML must show a preselected option before hydration, bind its `selected` attribute to the same model.

`UiUl` renders a native unordered list and accepts slotted list items and an accessible name through `aria-label` or `aria-labelledby`.

## Customizing the theme

In a Vite stylesheet, include the theme inside the selector that owns the controls.

```scss
@use '@goto/infrastructure-ui/styles.scss' as ui;

.controls {
  @include ui.theme($label-gap: 0.5rem);
}
```

To build the default stylesheet from Sass, include `ui.load-goto-ui-styles` once at the top level. Loading the entry alone emits no CSS. The theme declares custom properties for label spacing (`0.25rem`), list indentation (`1.5rem`) and text color (`currentColor`). Override any of them with the corresponding named mixin argument, `$label-gap`, `$list-indent` or `$text-color`. The public `ui.$palette` map holds the default `text` color. To set only the color, include `ui.palette($text-color: teal)`.

The package ships its Sass sources directly. In Dart Sass with the Node package importer, use `@use 'pkg:@goto/infrastructure-ui/styles.scss' as ui`.

## Build entry points

Vite starts at `entry.js`, which re-exports the components from `src/index.ts` and imports `src/scss/default.scss`. It bundles the components into `dist/index.js` and extracts `dist/style.css`, so consumers can opt into the default CSS with `@goto/infrastructure-ui/style.css`.

The declaration build runs `vue-tsc` from `src/index.ts` to produce `dist/index.d.ts`. Keeping the Sass import in the Vite entry lets TypeScript consumers resolve the component types without a Sass loader or stylesheet declaration.

## Sass layout

- `src/scss/_index.scss` exposes the public variables, mixins and theme loaders through the package entry.
- `public/variables/_colors.scss` defines the raw `$color-palette` and the light theme’s text role in `$theme-light`. `public/variables/_variables.scss` groups spacing in `$goto-ui-variables`. The `_index.scss` files collect each group.
- `public/mixins/_palette.scss` emits the text color declaration.
- `theme/_goto-ui-theme.scss` composes the declarations from a semantic theme, UI variables and color palette. Pass these three maps to `ui.load-goto-ui-theme` to supply a complete theme. `theme/light.scss` supplies the default maps and named overrides through `ui.theme`.
- The `buttons`, `labels`, `lists` and `selects` groups under `private/components` own the component partials. The group entries feed the default stylesheet loader in `theme/_default-styles.scss`.
