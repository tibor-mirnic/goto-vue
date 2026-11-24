# goto-vue

A Vite+ workspace with a vanilla TypeScript website in `apps/website` and a TypeScript library in `packages/utils`. The library exposes the named exports from `packages/utils/src/index.ts` through the package name `utils`.

## First checkout

Use Git 2.32 or newer for the hooks, Node.js matching `^22.22.1 || ^24.11.0 || >=26.0.0`, and pnpm 12.23.0. From the repository root, install the locked dependencies and check the workspace with its local Vite+ CLI.

```sh
pnpm install --frozen-lockfile
pnpm exec vp hooks status
pnpm exec vp run ready
```

For the root commands below, use `pnpm exec vp` in place of `vp` when running the project-local CLI. With the global CLI, `vp install --frozen-lockfile` also bootstraps the workspace. [Vite+ installation](https://viteplus.dev/guide/) · [Project-local CLI](https://viteplus.dev/guide/local-cli)

## Root commands

| Command           | What it does                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run dev`      | Starts the website dev server. Open the local URL it prints.                                                                                                        |
| `vp check`        | Checks workspace formatting, lint rules and TypeScript types.                                                                                                       |
| `vp test run`     | Runs unit tests once from the root. The current suite lives in `packages/utils/tests`.                                                                              |
| `vp run -r test`  | Runs each workspace package's test script. The pre-push hook uses this command.                                                                                     |
| `vp run -r build` | Type-checks and bundles the website into `apps/website/dist/` and packs the library's ESM and declarations into `packages/utils/dist/`.                             |
| `vp run ready`    | Builds first so declarations are available, then runs `vp check` and the package tests. Use this for a clean checkout or a full local check.                        |
| `vp run coverage` | Runs unit tests with V8 coverage across app and library source, including untested files. Prints a summary and writes the combined report to `coverage/index.html`. |

## Commits and pushes

Installation runs the root `prepare` script to register the hooks in `.vite-hooks/`. If a hook fails to run, check `vp hooks status` for the installed dispatcher at `.vite-hooks/_` and the three project hooks. Run `vp run prepare` to repeat setup. For runtime or package-manager problems, the global CLI provides `vp env doctor`.

- **Pre-commit** lints and formats staged JavaScript, TypeScript and Vue files under `apps/` and `packages/`, preserving unstaged edits. It merges duplicate imports and sorts named imports while preserving declaration order. Remove unused TypeScript imports manually. Use named exports in app and library source.
- **Commit-msg** validates Angular-style messages with commitlint. Use an imperative subject and an optional lowercase scope, for example `docs: document the developer workflow` or `fix(website): update the counter label`.
- **Pre-push** runs package unit tests. A failure blocks the push. Use `vp run -r test` to reproduce it.

## Tooling decisions

- The website runs its TypeScript check uncached because cached native compiler results could miss incompatible changes. Consumers import the library through its package entry point. Relative imports across packages still need an ownership rule.
- When Vue components enter the workspace, verify single-file component type errors, unused imports and coverage with the Vue transform. Choose component tests, Storybook and styling tools when a component needs them.
- Validate the packed library from a consumer before introducing a local registry such as Verdaccio. Release automation depends on a versioned artifact, owner and delivery target. The root test command supports CI once a provider is chosen.
