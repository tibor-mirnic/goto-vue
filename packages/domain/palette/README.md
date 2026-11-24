# @goto/domain-palette

`parsePaletteColors` decodes an unknown value into `PaletteColors`, a readonly list of color names. It accepts empty arrays and preserves names in input order, including duplicates. It throws a `TypeError` if the input is not an array or any name is not a string containing at least one non-whitespace character.

```ts
import { parsePaletteColors } from '@goto/domain-palette';

const colors = parsePaletteColors(['indigo', 'harbor blue']);
```

## Loading a palette

The host passes its JSON GET function and a state callback to `createPaletteSelection`. The callback receives `idle` immediately, then `loading` and either `ready` or `error` for the selected palette. The viewer can choose its own error message and bind its retry button to `selection.retry`.

```ts
import { createPaletteSelection } from '@goto/domain-palette';
import { createHttpClient } from '@goto/infrastructure-http-client';

const selection = createPaletteSelection(createHttpClient(fetch).getJson, (state) => {
  if (state.status === 'ready') console.log(state.palette, state.colors);
});

await selection.select('aurora');
```

The host serves an array of color names at `/palettes/<encoded palette name>.json`. For example, a Vite host can serve Aurora from `public/palettes/aurora.json`.

Each selection or retry cancels the previous request. Only the latest request can publish a result. `retry()` reloads the last selection and has no effect before the first selection. Call `selection.dispose()` when the viewer unmounts to cancel pending work and stop further requests and notifications.

## Source layout

- `src/api/palettes/` owns the palette color contract, decoder and JSON request, including the asset URL.
- `src/features/palette-viewer/` owns selection state, cancellation, retries and disposal.
- Each directory keeps its tests in `__tests__/`. Implementations and tests import from the files that define the symbols they use.
- Each resource and feature lists its public exports in an `index.ts`. The `src/api/` and `src/features/` indexes collect those named exports for the package entry in `src/index.ts`.
