# Arrow-function lint rule

The root Vite+ configuration loads the local Oxlint plugin through `lint.jsPlugins` and sets `workspace/require-arrow-functions` to `error`. Oxlint’s built-in `func-style` can require expressions for named functions, and `prefer-arrow-callback` covers callbacks. Together they still allow ordinary function expressions assigned to variables and shorthand methods on objects and classes. [Workspace configuration](../vite.config.ts) · [Rule implementation](./oxlint-plugin.mjs)

## Accepted TypeScript

```ts
export const palette = { colors: () => ['indigo', 'teal'] };
export const names = palette.colors().map((name) => name.toUpperCase());
```

Use an arrow field for an ordinary class method. Class constructors and object or class getters and setters retain their required syntax. Type-only declarations, including interface method signatures and ambient function declarations, have no implementation to check.

## Rejected TypeScript

Each declaration below produces one arrow-function error.

```ts
export const colors = function () {
  return ['indigo', 'teal'];
};
export const palette = {
  colors() {
    return ['indigo', 'teal'];
  }
};
```

The rule reports violations for manual correction. Arrows capture the surrounding `this`, and converting a prototype method to an arrow field creates a function per instance. An automatic rewrite could change behavior.

## Run the rule

From the repository root, lint the website counter without editing it.

```sh
pnpm exec vp lint apps/website/src/counter.ts
```

`vp check` runs the rule across the workspace. At commit time, `vp staged` runs lint on staged JavaScript, TypeScript and Vue files under `apps/` and `packages/`. An arrow-function error blocks the commit until it is corrected. [Pre-commit hook](../.vite-hooks/pre-commit)
