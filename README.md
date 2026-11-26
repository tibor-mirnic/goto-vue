# goto-vue

A Vite+ workspace with a Nuxt host in `apps/nuxt`, a Vue Router host in `apps/vite` and four private libraries. The [UI package](packages/infrastructure/ui/README.md) provides shared Vue controls, Sass and a Storybook. Import `PaletteModule` from `@goto/domain-palette` and the HTTP client from `@goto/infrastructure-http-client`. See the [palette package](packages/domain/palette/README.md) for its stylesheet, usage and Storybook. The SSR palette package provides `PePaletteSsrPage` for host-supplied view state and a separate palette read for server code. [SSR palette package](packages/domain/palette-ssr/README.md)

## First checkout

Use Git 2.32 or newer for the hooks, Node.js matching `^22.22.1 || ^24.11.0 || >=26.0.0`, and pnpm 12.23.0. From the repository root, install the locked dependencies and check the workspace with its local Vite+ CLI.

```sh
pnpm install --frozen-lockfile
pnpm exec vp hooks status
pnpm exec vp run ready
```

For the root commands below, use `pnpm exec vp` in place of `vp` when running the project-local CLI. With the global CLI, `vp install --frozen-lockfile` also bootstraps the workspace. [Vite+ installation](https://viteplus.dev/guide/) · [Project-local CLI](https://viteplus.dev/guide/local-cli)

## Root commands

| Command                                     | What it does                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run infrastructure-ui:storybook`        | Starts the UI Storybook on port 6006 with live Vue components, controls and documentation.                                                                          |
| `vp run infrastructure-ui:storybook:build`  | Builds the static UI Storybook in `packages/infrastructure/ui/storybook-static/`.                                                                                   |
| `vp run domain-palette:storybook`           | Starts the palette Storybook on port 6007 with the interactive palette viewer and local palette data.                                                               |
| `vp run domain-palette:storybook:build`     | Builds the static palette Storybook in `packages/domain/palette/storybook-static/`.                                                                                 |
| `vp run domain-palette-ssr:storybook`       | Starts the SSR palette Storybook on port 6008 with ready, empty, pending and retry examples.                                                                        |
| `vp run domain-palette-ssr:storybook:build` | Builds the static SSR palette Storybook in `packages/domain/palette-ssr/storybook-static/`.                                                                         |
| `vp run dev`                                | Starts the Vue Router host. Open `/palette` directly or follow the redirect from `/`.                                                                               |
| `vp run dev:nuxt`                           | Starts the Nuxt dev server. Open `/palette` or `/palette-ssr`.                                                                                                      |
| `vp run nuxt:e2e`                           | Runs Playwright against the Nuxt host.                                                                                                                              |
| `vp run vite:e2e`                           | Runs Playwright against the Vue Router host.                                                                                                                        |
| `vp check`                                  | Checks workspace formatting, lint rules and native TypeScript types after the HTTP client, UI and SSR palette libraries have been built.                            |
| `vp run check`                              | Runs each enrolled `vue:typecheck` task, then checks workspace formatting, lint and native TypeScript types.                                                        |
| `vp test run`                               | Runs all unit tests once from the root after the HTTP client, UI and SSR palette libraries have been built.                                                         |
| `vp run -r test`                            | Builds the palette’s HTTP client and UI dependencies and runs each package’s tests. The pre-push hook uses this command.                                            |
| `vp run -r build`                           | Builds the apps and libraries. The palette build checks Vue types and emits its module, declarations and stylesheet into `dist/`.                                   |
| `vp run ready`                              | Builds first, then runs `vp run check` and the package tests. Use this for a clean checkout or a full local check.                                                  |
| `vp run coverage`                           | Runs unit tests with V8 coverage across app and library source, including untested files. Prints a summary and writes the combined report to `coverage/index.html`. |

Use arrow functions for implementations, including callbacks, object methods and class methods. Class constructors and property getters and setters use method syntax. The rule applies only to implementations. [Arrow-function lint rule and examples](tooling/README.md)

## Host routes

Nuxt groups pages under `apps/nuxt/app/pages/(public)/` and `apps/nuxt/app/pages/(private)/`. Nuxt omits parenthesized folder names from URLs, so `(public)/palette.vue` serves `/palette`. A request to `/` redirects to `/palette` with HTTP `307`. [Nuxt route groups](https://nuxt.com/docs/4.x/directory-structure/app/pages#route-groups)

Run `vp run dev` for Vite or `vp run dev:nuxt` for Nuxt from the workspace root. Open `/palette` at the local URL printed by the server. The page starts idle with “Choose a palette” selected. Both hosts serve palette data from their own `public/palettes/` directory. Each file contains a JSON array of nonblank color names. Selecting `aurora` loads `/palettes/aurora.json` and lists `indigo` followed by `harbor blue`. Selecting `mist` loads `/palettes/mist.json`, an empty array (`[]`), and displays “No colors in mist”.

Open `/palette-ssr` on the Nuxt server to see Aurora selected by default. The first HTML response contains the list items `indigo` and `harbor blue` in that order. The route awaits its composable’s `useFetch` query before passing the initial state to `PePaletteSsrPage`. The composable owns selection and retry, and each Nuxt palette route registers its own compiled stylesheet. [SSR palette usage](packages/domain/palette-ssr/README.md)

`GET /api/palette-ssr` requires exactly one `name` query parameter with the lowercase value `aurora` or `mist`. It returns HTTP `200` with a JSON `{ palette, colors }` object. Aurora’s `colors` is `["indigo", "harbor blue"]` and Mist’s is `[]`. A missing, empty, repeated or unsupported `name` returns HTTP `400`, including when repeated values are identical.

Build and start the production Nuxt server from the workspace root.

```sh
vp run --no-cache @goto/nuxt-app#build
NITRO_HOST=127.0.0.1 NITRO_PORT=3000 node apps/nuxt/.output/server/index.mjs
```

In another terminal, inspect the HTML list, the redirect and examples of both API statuses.

```sh
curl -fsS http://127.0.0.1:3000/palette-ssr | rg -o '<li[^>]*>[^<]+</li>'
curl -sSi http://127.0.0.1:3000/
curl -sSi 'http://127.0.0.1:3000/api/palette-ssr?name=mist'
curl -sSi 'http://127.0.0.1:3000/api/palette-ssr?name=aurora&name=aurora'
```

The Vite host installs Vue Router in `apps/vite/src/main.ts` and renders the matched route in `App.vue`. The route table in `src/router.ts` redirects `/` to `/palette` and lazy-loads `src/routes/public/PaletteRoute.vue`. This route imports the palette module and its compiled stylesheet. The sibling `src/routes/private/` directory reserves space for future pages.

To deploy the Vite host, run `vp run @goto/vite-app#build` and serve `apps/vite/dist/` at the site root. Serve static files first, including `/assets/` and `/palettes/*.json`. Configure the host to fall back to `index.html` for client routes so direct visits and reloads at `/palette` reach Vue Router.

## Host end-to-end tests

After installing workspace dependencies, run the following once from the repository root to install the Chromium headless shell used by both Playwright workspaces.

```sh
pnpm --filter @goto/nuxt-e2e exec playwright install chromium --only-shell
```

Run `vp run nuxt:e2e` for the Nuxt host or `vp run vite:e2e` for the Vite/Vue Router host. Each suite builds its host, and Playwright starts the built server on a dedicated loopback port. Nuxt uses its Nitro server and Vite uses its preview server.

The specs under `apps/nuxt-e2e/tests/` and `apps/vite-e2e/tests/` exercise each host’s `/palette` route from the initial idle state through the Aurora and Mist selections, using the host’s static JSON fixtures. Unit and component tests run separately through Vitest.

To scaffold another host suite, create a private test workspace in an unused `apps/` directory. From the repository root, run the official Playwright generator through Vite+, passing the workspace’s directory name after `--`. The Vite suite used this form. [Vite+ generators](https://viteplus.dev/guide/create)

```sh
pnpm exec vp create create-playwright --no-interactive --no-agent --no-editor --no-hooks -- example-e2e --quiet --no-browsers --no-examples --browser chromium
```

The Nuxt suite ran the same generator directly from its test workspace directory. [Playwright installation](https://playwright.dev/docs/intro)

```sh
pnpm create playwright --quiet --no-browsers --no-examples --browser chromium
```

## Adding an app

From the repository root, use `pnpm exec vp create` with the framework generator and choose an unused name under `apps/`. The Vite host used the official Vue starter with TypeScript and Vue Router. Running this command in a workspace where `apps/vite` is available creates the bare starter there. [Vite+ generators](https://viteplus.dev/guide/create)

```sh
pnpm exec vp create vue --no-interactive --no-agent --no-editor --no-hooks --package-manager pnpm -- vite --ts --router --bare
```

The Nuxt host used the following command in a workspace where `apps/nuxt` was available. Vite+ selects `apps` as the parent directory. The first argument after `--` gives the Nuxt initializer the directory name `nuxt`, producing `apps/nuxt`.

```sh
pnpm exec vp create nuxt --no-interactive --no-agent --no-editor --no-hooks --package-manager pnpm -- nuxt -t minimal --no-install --no-modules --packageManager pnpm
```

1. Give the app a unique private package name, such as `@goto/nuxt-app`, so it can depend on the framework by its published name. Use `catalog:` for shared dependency versions and `workspace:*` for workspace libraries.
2. Keep the host’s `dev` and `build` scripts in its package. Add a root development shortcut following the existing `vp run dev` (Vite) and `vp run dev:nuxt` (Nuxt) commands. The root `ready` script builds every app and runs workspace checks and tests.
3. From the root, run `pnpm install` to update the shared `pnpm-lock.yaml`, then `pnpm install --frozen-lockfile` and `pnpm exec vp run ready` to verify the workspace. Start the new app with its development shortcut and open its entry route.

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
- **Commit-msg** validates Angular-style messages with commitlint. Use an imperative subject and an optional lowercase scope, for example `docs: document the developer workflow` or `fix(vite-app): update the counter label`.
- **Pre-push** runs package unit tests. A failure blocks the push. Use `vp run -r test` to reproduce it.

## Tooling decisions

- The Vite host runs its TypeScript check uncached because cached native compiler results could miss incompatible changes. Consumers import each library through its package entry point. Relative imports across packages still need an ownership rule.
- The UI controls and both palette viewers have colocated Storybook stories. Each preview loads its library’s default Sass entry. All three explorers share Canvas and Docs theme settings from `tooling/storybook/`. Vue template checks and component tests run through the workspace checks.
- Validate the packed library from a consumer before introducing a local registry such as Verdaccio. Release automation depends on a versioned artifact, owner and delivery target. The root test command supports CI once a provider is chosen.
