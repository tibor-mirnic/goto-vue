# goto-vue

A Vite+ workspace with a vanilla TypeScript website in `apps/website` and three private libraries. The [UI package](packages/infrastructure/ui/README.md) provides shared Vue controls, Sass and a Storybook. Import `PaletteModule` from `@goto/domain-palette` and the HTTP client from `@goto/infrastructure-http-client`. See the [palette package](packages/domain/palette/README.md) for its stylesheet and usage.

## First checkout

Use Git 2.32 or newer for the hooks, Node.js matching `^22.22.1 || ^24.11.0 || >=26.0.0`, and pnpm 12.23.0. From the repository root, install the locked dependencies and check the workspace with its local Vite+ CLI.

```sh
pnpm install --frozen-lockfile
pnpm exec vp hooks status
pnpm exec vp run ready
```

For the root commands below, use `pnpm exec vp` in place of `vp` when running the project-local CLI. With the global CLI, `vp install --frozen-lockfile` also bootstraps the workspace. [Vite+ installation](https://viteplus.dev/guide/) · [Project-local CLI](https://viteplus.dev/guide/local-cli)

## Root commands

| Command                                    | What it does                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run infrastructure-ui:storybook`       | Starts the UI Storybook on port 6006 with live Vue components, controls and documentation.                                                                          |
| `vp run infrastructure-ui:storybook:build` | Builds the static UI Storybook in `packages/infrastructure/ui/storybook-static/`.                                                                                   |
| `vp run dev`                               | Starts the website dev server. Open the local URL it prints.                                                                                                        |
| `vp check`                                 | Checks workspace formatting, lint rules and native TypeScript types after the HTTP client and UI libraries have been built.                                         |
| `vp run check`                             | Runs each enrolled `vue:typecheck` task, then checks workspace formatting, lint and native TypeScript types.                                                        |
| `vp test run`                              | Runs all unit tests once from the root after the HTTP client and UI libraries have been built.                                                                      |
| `vp run -r test`                           | Builds the palette’s HTTP client and UI dependencies and runs each package’s tests. The pre-push hook uses this command.                                            |
| `vp run -r build`                          | Builds the website and libraries. The palette build checks Vue types and emits its module, declarations and stylesheet into `dist/`.                                |
| `vp run ready`                             | Builds first, then runs `vp run check` and the package tests. Use this for a clean checkout or a full local check.                                                  |
| `vp run coverage`                          | Runs unit tests with V8 coverage across app and library source, including untested files. Prints a summary and writes the combined report to `coverage/index.html`. |

Use arrow functions for implementations, including callbacks, object methods and class methods. Class constructors and property getters and setters use method syntax. The rule applies only to implementations. [Arrow-function lint rule and examples](tooling/README.md)

## Adding a package

Start each new library from the built-in Vite+ TypeScript library template. From the workspace root, choose an unused directory under `packages/<group>/<library>` and run the generator. For example, this creates the `color-cache` directory in the existing infrastructure group.

```sh
pnpm exec vp create vite:library --directory packages/infrastructure/color-cache --no-interactive --no-agent --no-editor
```

1. Set the package name to `@goto/<group>-<library>` (here, `@goto/infrastructure-color-cache`), set `private` to `true` and describe the library. Remove placeholder author, license and repository metadata, public publishing settings and the `prepublishOnly` script.
2. Keep `type: "module"` and the `dist` files list. For a TypeScript-only library using `vp pack`, set `exports["."]` to `{ "types": "./dist/index.d.mts", "import": "./dist/index.mjs" }` and remove the template's `./package.json` export. Keep the generated build, dev, test and check scripts. Use `catalog:` for `@types/node`, `typescript` and `vite-plus`. Keep strict NodeNext TypeScript settings. In the package's Vite+ config, remove the generated `pack.exports` and `pack.deps.resolveDepSubpath` settings so the manifest defines the public entry point. Keep `pack.dts.generator` set to `tsgo`.
3. Replace the starter implementation with named public exports in `src/index.ts`. Replace the sample test with behavior tests under `tests/` or in `__tests__/` alongside their owning module, and document the public API in the package README with an example that imports from its scoped name. A workspace consumer declares the library with `workspace:*` in its dependencies.
4. Check whether the group matches the package globs in `pnpm-workspace.yaml` and the source globs for the named-export lint override and coverage include list in the root `vite.config.ts`. Add a glob wherever the group is missing.
5. For a package with Vue single-file components, add its `tsconfig.vue.json` and uncached `vue:typecheck` task. [Workspace Vue checker](tooling/README.md#vue-type-checking)
6. When adding Storybook to a new package or library, always run the official Storybook initializer from that package’s directory first. Start with the generated configuration, then add the package’s stories, documentation, preview settings and styles. [UI package initializer example](packages/infrastructure/ui/README.md#storybook)
7. After editing manifests, refresh the root lockfile, verify a frozen install, and run the workspace build, checks and tests. Include the updated `pnpm-lock.yaml` with the package.

```sh
pnpm install
pnpm install --frozen-lockfile
pnpm exec vp run ready
```

## Commits and pushes

Installation runs the root `prepare` script to register the hooks in `.vite-hooks/`. If a hook fails to run, check `vp hooks status` for the installed dispatcher at `.vite-hooks/_` and the three project hooks. Run `vp run prepare` to repeat setup. For runtime or package-manager problems, the global CLI provides `vp env doctor`.

- **Pre-commit** lints and formats staged JavaScript, TypeScript and Vue files under `apps/` and `packages/`, preserving unstaged edits. It merges duplicate imports and sorts named imports while preserving declaration order. Remove unused TypeScript imports manually. Use named exports in app and library source.
- **Commit-msg** validates Angular-style messages with commitlint. Use an imperative subject and an optional lowercase scope, for example `docs: document the developer workflow` or `fix(website): update the counter label`.
- **Pre-push** runs package unit tests. A failure blocks the push. Use `vp run -r test` to reproduce it.

## Tooling decisions

- The website runs its TypeScript check uncached because cached native compiler results could miss incompatible changes. Consumers import each library through its package entry point. Relative imports across packages still need an ownership rule.
- Shared UI components have colocated Storybook stories. The preview loads the same default Sass entry as the library. Vue template checks and component tests run through the workspace checks.
- Validate the packed library from a consumer before introducing a local registry such as Verdaccio. Release automation depends on a versioned artifact, owner and delivery target. The root test command supports CI once a provider is chosen.
