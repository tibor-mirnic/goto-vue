# @goto/domain-palette

## Mounting the Vue module

The palette stylesheet includes the shared controls, their theme and the viewer layout. Import it once in the host and mount `PaletteModule` as the page content for the host’s palette route. The chooser offers `aurora` and `mist`. It starts with no selection, displays the selected palette’s colors, and offers a retry if loading fails. Unmounting it cancels any pending request.

```vue
<script setup lang="ts">
import { PaletteModule } from '@goto/domain-palette';
import '@goto/domain-palette/style.css';
</script>

<template>
  <PaletteModule />
</template>
```

The domain API uses the workspace HTTP client to fetch the selected asset. Serve `/palettes/aurora.json` and `/palettes/mist.json` from the host with an array of nonempty color names, for example `["indigo", "harbor blue"]`. The viewer preserves the response order and duplicate colors. Selecting another palette cancels the earlier request.

## Source layout and build

- `src/index.ts` exports `PaletteModule`. The `/components` subpath resolves to the same compiled module and declarations.
- `src/module/PaletteModule.vue` mounts `PePalettePage`. The page provides the viewer’s context and mounts `PePaletteViewer`.
- `src/features/palette-viewer/index.ts` exposes the feature’s component and provider within the package. The provider supplies the two example names, connects the workflow to the domain API and disposes it with the page scope. The adjacent `usePaletteViewerControls.ts` composable binds the shared select’s model to the workflow. The viewer composes `UiLabel`, `UiSelect`, `UiButton` and `UiUl` from the public `@goto/infrastructure-ui` entry.
- `palette-selection.util.ts` and its colocated tests belong to the viewer feature. This utility coordinates loading, cancellation and retry through a domain loader that accepts a palette name and abort signal. The `src/api/palettes/` resource owns the request URL and payload decoder.

`src/style.scss` builds the shipped CSS by calling the shared UI loader and the internal palette loader once each. The Vite entry imports this stylesheet and re-exports the module.

`src/_index.scss` defines `load-pe-module`. Its defaults come from the public UI Sass entry. It passes `$theme`, `$variables` and `$color-palette`, in that order, through `load-pe-features` and `load-pe-pages` to each component’s colocated mixin. The viewer owns grid layout, wrapping and retry placement in `_pe-palette-viewer.scss`. The page composes the viewer, so its mixin currently emits no CSS.

Within the package, `vp run build` bundles the module and stylesheet, then emits declarations with the workspace Vue checker. `vp run dev` watches the JavaScript, CSS and declarations.
