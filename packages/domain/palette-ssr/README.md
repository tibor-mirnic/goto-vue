# @goto/domain-palette-ssr

## Mounting the Vue page

Declare `@goto/domain-palette-ssr` as a host dependency using `workspace:*`. Mount `PePaletteSsrPage` with a `state` prop and include the compiled stylesheet once. It contains the shared UI defaults and the viewer layout. This Vue example uses local data.

```vue
<script setup lang="ts">
import { type PaletteName, type PaletteViewerState, PePaletteSsrPage } from '@goto/domain-palette-ssr';
import { shallowRef } from 'vue';

const colors = { aurora: ['indigo', 'harbor blue'], mist: [] };
const state = shallowRef<PaletteViewerState>({ status: 'ready', palette: 'aurora', colors: colors.aurora });
const select = (palette: PaletteName) => {
  state.value = { status: 'ready', palette, colors: colors[palette] };
};
</script>

<template>
  <PePaletteSsrPage :state="state" @select="select" />
</template>

<style src="@goto/domain-palette-ssr/style.css"></style>
```

`PaletteViewerState` carries the selected `palette` and a `status` of `pending`, `error` or `ready`. A `ready` state includes the ordered `colors` array, which can be empty. The page renders synchronously and updates when the host replaces the state. It emits `select` with the chosen `PaletteName` and `retry` when the user clicks Retry in an error state.

The Nuxt route composable selects Aurora and calls `useFetch`. The route awaits the query before supplying the initial state, and Nuxt reuses the server result during hydration. A changed selection or Retry refreshes the current palette once. The composable cancels superseded requests and supplies successful data that matches the current selection. [Nuxt route](../../../apps/nuxt/app/pages/%28public%29/palette-ssr.vue) · [Route composable](../../../apps/nuxt/app/features/public/palette-ssr/composables/usePaletteSsrRoute.ts)

## Package layout

- `src/api/palette.models.ts` defines the palette names, result type and name guard shared by API code and the viewer.
- `src/api/server/` implements the fixture read that Nitro calls through `@goto/domain-palette-ssr/server`. The Nuxt route composable calls the Nitro endpoint through `useFetch`.
- `src/api/client/` is for reads that go directly from the browser to the data source. The sibling palette package’s [static asset read](../palette/src/api/palettes/palettes.api.ts) is an example.
- `src/features/palette-ssr-viewer/` contains the viewer and its private `color-list/`, `picker/`, `retry/`, and `status/` directories. The picker owns `picker/usePaletteSsrPicker.ts`, and the status component owns `status/usePaletteSsrStatus.ts`. The page’s `__tests__/` directory covers rendering the supplied state and forwarding the viewer’s events.

Use PascalCase for Vue component filenames. Name feature directories after the main component in kebab-case with the `Pe` module prefix removed, as in `PePaletteSsrViewer.vue` in `palette-ssr-viewer/`. Use camelCase TypeScript stems with `.provider.ts` and `.models.ts` suffixes for providers and models, as in `paletteViewer.provider.ts` and `paletteViewer.models.ts`.

## Reading palettes on the server

Use `@goto/domain-palette-ssr/server` in server code to read a palette from a supplied source. The result can initialize the page’s state or be returned from the host’s HTTP endpoint.

```ts
import { getPalette, readFixturePaletteColors } from '@goto/domain-palette-ssr/server';

export const initialPalette = await getPalette('aurora', readFixturePaletteColors);
```

`getPalette(name, source)` returns a promise for a serializable `PaletteResult` with `palette` and `colors`. A `PaletteSource` returns a color array synchronously or asynchronously. The fixture source returns `indigo` followed by `harbor blue` for Aurora and an empty array for Mist. Use `isPaletteName(value)` to validate untrusted input. `getPalette` rejects unsupported names with a `RangeError`.

## Storybook

Run `vp run domain-palette-ssr:storybook` from the workspace root and open port 6008. In **Palette SSR → Features → PePaletteSsrViewer**, **Ready** shows Aurora’s colors, **Empty** shows Mist, and **Pending** shows the loading state. In **Retry After Failure**, click **Retry** to restore Aurora’s colors. Each story uses the viewer’s provider with its own local data.

Run `vp run domain-palette-ssr:storybook:build` to generate `packages/domain/palette-ssr/storybook-static/`.
