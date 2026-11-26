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

Serve `/palettes/aurora.json` and `/palettes/mist.json` from the host with an array of nonempty color names, for example `["indigo", "harbor blue"]`. The viewer preserves the response order and duplicate colors. Selecting another palette cancels the earlier request.

## Storybook

Run `vp run domain-palette:storybook` from the workspace root and open port 6007. In **Palette → Features → PePaletteViewer**, choose **aurora** to see a list of colors or **mist** for an empty result. **Retry After Failure** starts at a failed request. Click **Retry** to load Aurora’s colors. The Docs page shows how the page provides state to the viewer. Each story mounts its own provider.

The explorer serves `.storybook/public/palettes/` at `/palettes/`. Stories use the same loader and decoder as the page. The retry example supplies one failed response before retrying against the local asset. Canvas and Docs load the module’s default `src/style.scss` and share the UI explorer’s System, Light and Dark theme choices.

Run `vp run domain-palette:storybook:build` to generate `packages/domain/palette/storybook-static/`. Serve that directory at the web origin’s root so the absolute palette URLs resolve. Both commands build the module’s workspace dependencies first.

The package’s configuration was generated from this directory using the official initializer, with the same pinned Vue/Vite and Docs versions as the UI explorer.

```sh
npm exec --yes --package=create-storybook@10.6.9 -- create-storybook \
  --type vue3 --builder vite --package-manager pnpm --features docs \
  --yes --no-agent --no-dev --disable-telemetry
```

## Source layout and build

- `src/index.ts` exports `PaletteModule`. The `/components` subpath resolves to the same compiled module and declarations.
- `src/module/PaletteModule.vue` mounts `PePalettePage`. The page provides the viewer’s context and mounts `PePaletteViewer`.
- `src/features/palette-viewer/index.ts` exposes the viewer and its provider within the package. `paletteViewer.provider.ts` supplies the palette names, loads static assets through the domain API, and disposes the selection workflow with the page scope. `paletteViewer.models.ts` defines the viewer state, and `paletteSelection.util.ts` coordinates loading, cancellation and retry.
- `src/api/palettes/palettes.api.ts` builds the request URL and uses the workspace HTTP client. The adjacent `paletteColors.models.ts` decodes the response.
- `PePaletteViewer.vue` composes the private components in `color-list/`, `picker/`, `retry/`, and `status/`. The picker keeps its select binding in `picker/usePalettePicker.ts`, and the status component keeps its display logic in `status/usePaletteStatus.ts`. The child components use `UiLabel`, `UiSelect`, `UiButton` and `UiUl` from the public `@goto/infrastructure-ui` entry.

Vue component filenames use PascalCase. The feature directory is the main component name in kebab-case with the `Pe` module prefix removed, as in `PePaletteViewer.vue` in `palette-viewer/`. TypeScript files use camelCase stems, as in `paletteViewer.provider.ts`, `paletteViewer.models.ts`, and `paletteSelection.util.ts`.

`src/style.scss` builds the shipped CSS by calling the shared UI loader and the internal palette loader once each. The Vite entry imports this stylesheet and re-exports the module.

`src/_index.scss` defines `load-pe-module`. Its defaults come from the public UI Sass entry. It passes `$theme`, `$variables` and `$color-palette`, in that order, through `load-pe-features` and `load-pe-pages` to each component’s colocated mixin. The viewer owns grid layout, wrapping and retry placement in `_pe-palette-viewer.scss`. The page composes the viewer, so its mixin currently emits no CSS.

Within the package, `vp run build` bundles the module and stylesheet, then emits declarations with the workspace Vue checker. `vp run dev` watches the JavaScript, CSS and declarations.
