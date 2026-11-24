# @goto/domain-palette

`parsePaletteColors` decodes an unknown value into `PaletteColors`, a readonly list of color names. It accepts empty arrays and preserves names in input order, including duplicates. It throws a `TypeError` if the input is not an array or any name is not a string containing at least one non-whitespace character.

```ts
import { parsePaletteColors } from '@goto/domain-palette';

const colors = parsePaletteColors(['indigo', 'harbor blue']);
```
