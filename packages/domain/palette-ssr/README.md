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

The Nuxt route composable selects Aurora and calls `useFetch` against the same-origin `GET /api/palette-ssr?name=aurora`. The route awaits the query before supplying the initial state. Nuxt reuses the SSR payload on hydration without a second GET. A changed selection or Retry refreshes the current palette once, and the composable cancels superseded requests. [Nuxt route](../../../apps/nuxt/app/pages/%28public%29/palette-ssr.vue) · [Route composable](../../../apps/nuxt/app/features/public/palette-ssr/composables/usePaletteSsrRoute.ts)

## Package layout

- `src/api/palette.models.ts` defines the palette names, result type and name guard shared by API code and the viewer.
- `src/api/server/` implements the HTTP palette read that Nitro calls through `@goto/domain-palette-ssr/server`. The Nuxt route composable calls the Nitro endpoint through `useFetch`.
- `src/api/client/` is for reads that go directly from the browser to the data source. The sibling palette package’s [palette API read](../palette/src/api/palettes/palettes.api.ts) is an example.
- `src/features/palette-ssr-viewer/` contains the viewer and its private `color-list/`, `picker/`, `retry/`, and `status/` directories. The picker owns `picker/usePaletteSsrPicker.ts`, and the status component owns `status/usePaletteSsrStatus.ts`. The page’s `__tests__/` directory covers rendering the supplied state and forwarding the viewer’s events.

Use PascalCase for Vue component filenames and match the component stem in its stories and tests, as in `PePaletteSsrViewer.stories.ts`. Name feature directories after the main component in kebab-case with the `Pe` module prefix removed, as in `PePaletteSsrViewer.vue` in `palette-ssr-viewer/`. Use camelCase TypeScript stems with `.provider.ts` and `.models.ts` suffixes for providers and models, as in `paletteViewer.provider.ts` and `paletteViewer.models.ts`.

## Reading palettes on the server

Use `@goto/domain-palette-ssr/server` in server code to read a palette from a configured API origin. The result can initialize the page’s state or be returned from the host’s HTTP endpoint.

```ts
import { getPalette } from '@goto/domain-palette-ssr/server';

export const initialPalette = await getPalette('aurora', 'https://palette.example.test');
```

`getPalette(name, origin)` returns a promise for a serializable `PaletteResult` with `palette` and `colors`. It rejects unsupported names with a `RangeError` before sending a request, then checks the HTTP response and validates the color array. The host can use `isPaletteName(value)` to report an invalid request before calling the reader.

Nitro uses the server process's `API_URL` as the Hono origin and forwards the validated result as `{ palette, colors }`. Its endpoint returns 400 for an invalid query and 502 for a failed upstream read or invalid response. The page displays the host's error state and offers **Retry**. [Nuxt development and production setup](../../../README.md#host-routes) · [Nitro endpoint](../../../apps/nuxt/server/api/palette-ssr.get.ts)

## Storybook

After [workspace setup](../../../README.md#first-checkout), run `pnpm domain-palette-ssr:storybook` from the root and open port 6008. In **Palette SSR → Features → PePaletteSsrViewer**, **Ready** shows Aurora’s colors, **Empty** shows Mist, and **Pending** shows the loading state. In **Retry After Failure**, click **Retry** to restore Aurora’s colors. Each story uses the viewer’s provider with its own local data and runs with Hono stopped.

Run `pnpm domain-palette-ssr:storybook:build` to generate `packages/domain/palette-ssr/storybook-static/`.
