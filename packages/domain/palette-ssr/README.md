# @goto/domain-palette-ssr

## Mounting the Vue module

Declare `@goto/domain-palette-ssr` as a host dependency using `workspace:*`. Mount `PaletteSsrModule` with the host’s selected palette and load state. Include the compiled stylesheet once. It contains the shared UI defaults and the viewer layout.

```vue
<script setup lang="ts">
import { PaletteSsrModule } from '@goto/domain-palette-ssr';
import type { PaletteName, PaletteResult } from '@goto/domain-palette-ssr/server';

const props = defineProps<{
  selectedPalette: PaletteName;
  status: 'pending' | 'ready' | 'error';
  result?: PaletteResult | null;
}>();

const emit = defineEmits<{
  select: [palette: PaletteName];
  retry: [];
}>();
</script>

<template>
  <PaletteSsrModule v-bind="props" @select="emit('select', $event)" @retry="emit('retry')" />
</template>

<style src="@goto/domain-palette-ssr/style.css"></style>
```

The host supplies `selectedPalette` (`aurora` or `mist`), `status` and an optional `result`. Use `pending` while loading, `ready` with a matching result and `error` to show Retry. A ready state with a missing result or a result for a different palette displays as pending. A matching result with an empty color list displays the empty state.

The module emits `select(palette)` when the user chooses a different palette and `retry()` when they click Retry. The module makes no requests. The host loads the selected palette or retries the current one and applies only the latest request’s outcome. For SSR, supply the same initial selection, status and result for the server render and hydration.

## Reading palettes on the server

Use `@goto/domain-palette-ssr/server` in server code to read a palette without a browser or HTTP origin. For example, a host can supply the following result with `selectedPalette="aurora"` and `status="ready"` to render the colors on the first response.

```ts
import { getPalette, readFixturePaletteColors } from '@goto/domain-palette-ssr/server';

export const initialPalette = await getPalette('aurora', readFixturePaletteColors);
```

`getPalette(name, source)` returns a promise for a serializable `PaletteResult` with `palette` and `colors`. A `PaletteSource` returns a color array synchronously or asynchronously. The fixture source returns `indigo` followed by `harbor blue` for Aurora and an empty array for Mist. Use `isPaletteName(value)` to validate untrusted input. `getPalette` rejects unsupported names with a `RangeError`.

## Storybook

Run `vp run domain-palette-ssr:storybook` from the workspace root and open port 6008. In **Palette SSR → Features → PePaletteSsrViewer**, **Ready** shows Aurora’s colors, **Empty** shows Mist, and **Pending** shows the loading state. In **Retry After Failure**, click **Retry** to restore Aurora’s colors. Each story uses the viewer’s provider with its own local data.

Run `vp run domain-palette-ssr:storybook:build` to generate `packages/domain/palette-ssr/storybook-static/`.
