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

## Storybook

From the workspace root, run `vp run infrastructure-ui:storybook` and open the local address it prints (port 6006). Open **Styleguide → About** for installation and theming, or browse **Components** for documentation, source examples and interactive controls. Stories import the local Vue components and the preview loads `src/scss/default.scss` once. The toolbar’s theme menu applies to Canvas and the full Docs page, including About, controls tables and live examples. **System** follows your OS as it changes. **Light** and **Dark** select a fixed appearance. The Storybook manager keeps its own theme.

Each control lives in its own kebab-case directory, for example `src/components/selects/ui-select/`. Keep its Vue component, story, private composable and composable tests together. Each component and group has an explicit named export in its `index.ts`.

Use `vp run infrastructure-ui:storybook:build` to generate a static site in `packages/infrastructure/ui/storybook-static/`.

The original scaffold came from Storybook’s official initializer. To reproduce it in a checkout from before Storybook was added, set `allowBuilds.esbuild` to `false` in the root `pnpm-workspace.yaml` (the platform binary is supplied separately), then run this command from `packages/infrastructure/ui`.

```sh
npm exec --yes --package=create-storybook@10.6.9 -- create-storybook \
  --type vue3 --builder vite --package-manager pnpm --features docs \
  --yes --no-agent --no-dev --disable-telemetry
```

The workspace pins the generated dependencies in the pnpm catalog. The preview uses a dedicated Vite config so it can load Vue components independently of the library build.

## Customizing the theme

The packaged stylesheet follows the OS color preference. Set `data-goto-ui-theme="light"` or `data-goto-ui-theme="dark"` on `html` to pin an appearance, or on a container to theme its controls. Remove the attribute to inherit the surrounding theme. Hosts can use `--goto-ui-canvas-color` and `--goto-ui-text-color` for their own surrounding surfaces.

The default stylesheet applies `box-sizing: border-box` globally to every element, including `html`, and to `::before` and `::after`. Padding and borders count toward declared sizes. Import the stylesheet once before host overrides.

Override individual properties on a component container to retain the other active theme colors.

```css
.controls {
  --goto-ui-label-gap: 0.5rem;
}
```

Use `ui.theme` inside a selector to apply a light or dark palette. Each include sets the scheme, semantic colors and spacing for that subtree.

```scss
@use '@goto/infrastructure-ui/styles.scss' as ui;

.controls {
  @include ui.theme($scheme: light, $label-gap: 0.5rem);
}

.controls-preview {
  @include ui.theme(
    $scheme: dark,
    $roles: (
      accent: lavender
    ),
    $color-palette: (
      lavender: #d4c6ff
    )
  );
}
```

The default scheme is light. The first three arguments remain `$label-gap` (default `0.25rem`), `$list-indent` (default `1.5rem`) and `$text-color` (defaults to the scheme’s text role, `currentColor` for scoped light themes). Use `ui.palette($text-color: indigo)` to emit just the text color property.

To migrate `ui.load-goto-ui-theme($theme, $variables, $colors)`, pass the semantic map as `$roles`, the raw color map as `$color-palette`, and the two values from `$variables.spacing` as `$label-gap` and `$list-indent`. Choose `$scheme: dark` for dark themes.

To compile the packaged OS defaults, attribute selectors, reset and component rules, include `ui.load-goto-ui-styles` once at the top level. Importing the Sass definitions alone emits no CSS.

For a custom build, call the stylesheet loader in your host’s Sass entry and import that compiled sheet once.

```scss
@use '@goto/infrastructure-ui/styles.scss' as ui;

@include ui.load-goto-ui-styles(
  $variables: (
    control: (
      min-height: 3rem
    ),
    spacing: (
      label-gap: 1rem
    )
  ),
  $light-roles: (
    accent: violet
  ),
  $dark-roles: (
    accent: periwinkle
  ),
  $color-palette: (
    violet: #514099,
    periwinkle: #ccc4ff
  )
);
```

Buttons and selects compile with a `3rem` minimum height. Each scheme sets the label gap to `1rem` and supplies its accent color to button fills, focus rings and list markers. System dark and explicit dark containers use periwinkle. Light containers use violet. Scoped CSS properties can still override colors, label gap and list indentation. The shared control minimum height and border radius are compile-time dimensions.

The package ships its Sass sources directly. In Dart Sass with the Node package importer, use `@use 'pkg:@goto/infrastructure-ui/styles.scss' as ui`.

## Build entry points

Vite starts at `entry.js`, which re-exports the components from `src/index.ts` and imports `src/scss/default.scss`. It bundles the components into `dist/index.js` and extracts `dist/style.css`, so consumers can opt into the default CSS with `@goto/infrastructure-ui/style.css`.

The declaration build runs `vue-tsc` from `src/index.ts` to produce `dist/index.d.ts`. Keeping the Sass import in the Vite entry lets TypeScript consumers resolve the component types without a Sass loader or stylesheet declaration.

## Sass layout

- `src/scss/_index.scss` exposes the public variables, mixins and stylesheet loader through the package entry.
- `public/variables/_colors.scss` defines the raw `$color-palette` and the semantic roles in `$theme-light` and `$theme-dark`. `public/variables/_variables.scss` groups spacing and shared control dimensions in `$goto-ui-variables`. The `_index.scss` files collect each group.
- `public/mixins/_palette.scss` emits the text color declaration.
- `theme/_goto-ui-theme.scss` implements `ui.theme` for both schemes.
- `private/base/_index.scss` supplies the global box-sizing rule.
- The `buttons`, `labels`, `lists` and `selects` groups under `private/components` own the component partials. The stylesheet loader passes the light role map, UI variables and raw palette through the component group to each partial. Each component reads its dimensions or spacing from the variables. The private `color.themed` function resolves a role through the palette and returns a CSS custom property with that fallback. The browser inherits the active scheme’s property.
