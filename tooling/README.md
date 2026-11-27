# Workspace tooling

## Arrow-function lint rule

The root Vite+ configuration loads the local Oxlint plugin through `lint.jsPlugins` and sets `workspace/require-arrow-functions` to `error`. Oxlint’s built-in `func-style` can require expressions for named functions, and `prefer-arrow-callback` covers callbacks. Together they still allow ordinary function expressions assigned to variables and shorthand methods on objects and classes. [Workspace configuration](../vite.config.ts) · [Rule implementation](./oxlintPlugin.mjs)

### Accepted TypeScript

```ts
export const palette = { colors: () => ['indigo', 'teal'] };
export const names = palette.colors().map((name) => name.toUpperCase());
```

Use an arrow field for an ordinary class method. Class constructors and object or class getters and setters retain their required syntax. Type-only declarations, including interface method signatures and ambient function declarations, have no implementation to check.

### Rejected TypeScript

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

### Run the rule

From the repository root, lint the Vite host’s router without editing it.

```sh
pnpm exec vp lint apps/vite/src/router.ts
```

`vp check` runs the rule across the workspace. At commit time, `vp staged` runs lint on staged JavaScript, TypeScript and Vue files under `apps/` and `packages/`. An arrow-function error blocks the commit until it is corrected. [Pre-commit hook](../.vite-hooks/pre-commit)

## Vue type checking

Run `vp run check` from the workspace root. It discovers packages that define `vue:typecheck` through `vp run -r vue:typecheck`, builds their declared prerequisites, then runs formatting, lint and native TypeScript checks. To check one package, run `vp run vue:typecheck` in its directory.

Each Vue package defines a `tsconfig.vue.json` that includes its SFCs and TypeScript sources and enables `strictTemplates`. Register a `vue:typecheck` task with `cache: false` in the package’s `vite.config.ts` so changes to imported types and templates are always checked. Invoke the root adapter using a path relative to the package directory. For example, the palette task uses this command.

```sh
node ../../../tooling/vueTsc.cjs -p tsconfig.vue.json
```

The adapter selects the JavaScript TypeScript 6 compiler API required by `vue-tsc`. Its compiler arguments and project paths are interpreted from the caller’s directory. The root owns both checker dependencies, while the workspace’s native TypeScript compiler stays on version 7. A library can use the same adapter with a build tsconfig that enables declaration emit for its public entries. [Palette declaration configuration](../packages/domain/palette/tsconfig.build.json)
