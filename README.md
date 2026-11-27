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
| `pnpm dev`                                  | Starts the Vue Router host. Run the Hono API alongside it for real palette reads.                                                                                   |
| `pnpm dev:api`                              | Starts the Hono palette API at `127.0.0.1:4000`. Use `HOST` and `PORT` to override it.                                                                              |
| `pnpm dev:nuxt`                             | Starts the Nuxt dev server. Run Hono alongside it for real chooser and SSR reads.                                                                                   |
| `pnpm vite:e2e` / `pnpm vite:e2e:mock`      | Runs the Vite production or development mock Playwright suite.                                                                                                      |
| `pnpm nuxt:e2e` / `pnpm nuxt:e2e:mock`      | Runs the Nuxt production or development mock Playwright suite.                                                                                                      |
| `vp check`                                  | Checks workspace formatting, lint rules and native TypeScript types after the HTTP client, UI and SSR palette libraries have been built.                            |
| `vp run check`                              | Runs each enrolled `vue:typecheck` task, then checks workspace formatting, lint and native TypeScript types.                                                        |
| `vp test run`                               | Runs all unit tests once from the root after the HTTP client, UI and SSR palette libraries have been built.                                                         |
| `vp run -r test`                            | Builds the palette’s HTTP client and UI dependencies and runs each package’s tests. The pre-push hook uses this command.                                            |
| `vp run -r build`                           | Builds the apps and libraries. The palette build checks Vue types and emits its module, declarations and stylesheet into `dist/`.                                   |
| `vp run ready`                              | Builds first, then runs `vp run check` and the package tests. Use this for a clean checkout or a full local check.                                                  |
| `vp run coverage`                           | Runs unit tests with V8 coverage across app and library source, including untested files. Prints a summary and writes the combined report to `coverage/index.html`. |

Use arrow functions for implementations, including callbacks, object methods and class methods. Class constructors and property getters and setters use method syntax. The rule applies only to implementations. [Arrow-function lint rule and examples](tooling/README.md)

## Host routes

Vite installs Vue Router in `main.ts` and renders the matched route in `App.vue`. The router redirects `/` to `/palette` and lazy-loads `PaletteRoute.vue`, which imports the palette module and its compiled stylesheet. The sibling `src/routes/private/` directory reserves space for future pages. [Vite router](apps/vite/src/router.ts) · [Vite palette route](apps/vite/src/routes/public/PaletteRoute.vue)

Nuxt sends a 307 redirect from `/` to `/palette` and also serves `/palette-ssr`. Nuxt's `(public)` and `(private)` directories group pages without adding URL segments. Each palette page registers its compiled stylesheet under the same head link key so the active route supplies the stylesheet. [Nuxt chooser route](apps/nuxt/app/pages/%28public%29/palette.vue) · [Nuxt SSR route](apps/nuxt/app/pages/%28public%29/palette-ssr.vue) · [Nuxt route groups](https://nuxt.com/docs/4.x/directory-structure/app/pages#route-groups)

### Run against Hono

From the workspace root, run each command in its own terminal.

| Process              | Command                               | Default address                                                         |
| -------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| Hono API             | `pnpm dev:api`                        | `http://127.0.0.1:4000`                                                 |
| Vite chooser         | `ENABLE_MOCK_API=false pnpm dev`      | `http://localhost:5173/palette`                                         |
| Nuxt chooser and SSR | `ENABLE_MOCK_API=false pnpm dev:nuxt` | `http://localhost:3000/palette` and `http://localhost:3000/palette-ssr` |

Use the address printed at startup if a host chooses a different port. Hono accepts `HOST` and `PORT`. If its address changes, set `API_URL` when starting Vite development, Vite preview or Nuxt. Use the upstream origin only, for example `API_URL=http://127.0.0.1:4100`, and omit the `/api` suffix. Both hosts keep browser requests same-origin. Vite forwards `/api/` and Nitro forwards the chooser requests to Hono. [Vite proxy](apps/vite/vite.config.ts) · [Nitro chooser proxy](apps/nuxt/server/api/palettes/%5Bname%5D.get.ts)

On either `/palette`, “Choose a palette” is selected initially and no palette GET is sent. Select Aurora to send one `GET /api/palettes/aurora` and display `indigo` followed by `harbor blue`. Select Mist to send one `GET /api/palettes/mist`. The chooser receives a raw JSON array, so Mist returns `[]` and displays “No colors in mist”.

On Nuxt's `/palette-ssr`, the server first reads Aurora through `GET /api/palette-ssr?name=aurora`. Nitro reads Hono, validates the color array and returns `{ palette, colors }`. The initial HTML and Nuxt payload contain Aurora's ordered colors. Hydration reuses the payload without a duplicate browser GET. Each changed selection or Retry sends one browser request to the same Nitro endpoint. The endpoint returns 400 for a missing, empty, repeated or unsupported name and 502 for a failed or invalid upstream response. [SSR package and request flow](packages/domain/palette-ssr/README.md)

### Check an outage and Retry

Leave the hosts running with mocks off and stop Hono with Ctrl+C in its terminal. Open a fresh `/palette` on either host and select Aurora. Open a fresh `/palette-ssr` on Nuxt. Each page shows “Could not load aurora.” and offers **Retry**. A direct request to the Nuxt SSR API returns 502 while Hono is down.

```sh
curl -si 'http://localhost:3000/api/palette-ssr?name=aurora'
```

Restart Hono with `pnpm dev:api` and click **Retry** without reloading the page. Each retry reads Aurora once and restores the real colors.

### Run with development mocks

Stop Hono and restart each development host with the exact value `ENABLE_MOCK_API=true`. Run each command in its own terminal.

```sh
ENABLE_MOCK_API=true pnpm dev
ENABLE_MOCK_API=true pnpm dev:nuxt
```

Open the same routes. Both choosers stay idle until selection. Aurora now shows `coral` followed by `violet`, and Mist still shows “No colors in mist”. Nuxt's `/palette-ssr` renders the mock Aurora in the initial HTML and payload, then uses mock data for later changed selections and Retry. Vite waits for the browser MSW worker before mounting Vue. Nuxt handles chooser requests on the server and intercepts Nitro's outbound SSR reads there. Check Vite's mock responses in the browser because the worker handles those requests. Restart the hosts with the flag unset or set to `false` to resume real reads. [Vite mock startup](apps/vite/src/main.ts) · [Nuxt mock registration](apps/nuxt/nuxt.config.ts)

### Build and run the production hosts

Start Hono as above, or build and run its Node entry in a separate terminal.

```sh
pnpm exec vp run @goto/api#build
node apps/api/dist/index.js
```

Build Nuxt and set `API_URL` on the Nitro process at runtime. `NITRO_HOST` and `NITRO_PORT` control where Nitro listens.

```sh
ENABLE_MOCK_API=true pnpm exec vp run --no-cache @goto/nuxt-app#build
API_URL=http://127.0.0.1:4000 ENABLE_MOCK_API=true NITRO_HOST=127.0.0.1 NITRO_PORT=3000 node apps/nuxt/.output/server/index.mjs
```

Build Vite and start local preview in a separate terminal. Preview inherits the development proxy and reads `API_URL` at startup.

```sh
ENABLE_MOCK_API=true pnpm exec vp run --no-cache @goto/vite-app#build
API_URL=http://127.0.0.1:4000 ENABLE_MOCK_API=true pnpm --filter @goto/vite-app preview --host 127.0.0.1 --port 4173 --strictPort
```

These examples deliberately set the mock flag during build and startup. Both production hosts still read Hono. At `http://127.0.0.1:4173/palette` and `http://127.0.0.1:3000/palette`, select Aurora and verify the real colors. On Nuxt, verify the SSR envelope and a 400 for a repeated name. Stop Hono and repeat an Aurora selection or SSR load to verify the outage behavior.

```sh
curl -si http://127.0.0.1:4173/api/palettes/aurora
curl -si 'http://127.0.0.1:3000/api/palette-ssr?name=aurora'
curl -si 'http://127.0.0.1:3000/api/palette-ssr?name=aurora&name=aurora'
```

### Deploy the Vite static build

Serve `apps/vite/dist/` at the site root. Configure the deployment's proxy with the Hono origin and route `/api/` before the SPA fallback. Pass the request path and query through unchanged. Serve build assets directly and apply the `index.html` fallback to client routes like `/palette`. Vite preview's proxy only applies to local preview.

This nginx example assumes the build is at `/srv/goto-vue/apps/vite/dist` and Hono listens on the same machine. The `proxy_pass` target has no URI suffix, which preserves `/api/` in the forwarded path. [nginx proxy forwarding](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass) · [nginx file fallback](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

```nginx
server {
    listen 8080;
    root /srv/goto-vue/apps/vite/dist;

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_intercept_errors off;
    }

    location ^~ /assets/ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Check that direct entry and reload at `/palette` render the chooser and that `/api/palettes/aurora` returns JSON. Request `/api/palettes/missing` and verify Hono's 404 reaches the client.

## Host end-to-end tests

After installing workspace dependencies, install the Chromium headless shell from the root. Run the four suites in sequence. Each owns its host and API processes and uses separate loopback ports. Use separate checkouts for parallel runs because suites share generated build files within a checkout.

```sh
pnpm --filter @goto/nuxt-e2e exec playwright install chromium --only-shell
pnpm vite:e2e
pnpm nuxt:e2e
pnpm vite:e2e:mock
pnpm nuxt:e2e:mock
```

The production suites use Vite preview and built Nitro. They exercise real chooser reads with the mock flag set, then stop Hono and verify failure. The development suites check mocked responses with Hono down, restart without mocks and check real reads and Retry after an outage. Nuxt also covers SSR HTML and payload, hydration, later selections, Retry and query validation. Unit and component tests run through the workspace's `ready` command.

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

The palette API used the official Hono Node.js template. Decline the generator’s dependency install prompt so Vite+ can integrate the app with the workspace lockfile. [Hono Node.js starter](https://hono.dev/docs/getting-started/nodejs)

```sh
pnpm exec vp create create-hono --no-interactive --no-agent --no-editor --no-hooks --package-manager pnpm -- api --template nodejs --pm pnpm
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

## File naming

- Use camelCase stems for project-owned TypeScript, JavaScript and tooling files, as in `httpClient.ts` and `vueTsc.cjs`. Use purpose suffixes such as `.models.ts`, `.provider.ts`, and `.util.ts` where they describe the file’s role. Preserve `.api.ts` and `.api.moq.ts` for resource APIs and their mock handlers. Tests keep the source file’s stem and purpose suffix, as in `palettes.api.test.ts`.
- Name Vue components in PascalCase and match the component’s full stem in its stories and tests, as in `UiUl.stories.ts` and `PePaletteSsrPage.test.ts`. Keep feature directories in kebab-case.
- Use kebab-case for Sass partials and keep their leading underscore, as in `_pe-palette-viewer.scss`. Framework-discovered routes, configuration files, and ambient declarations follow their tool’s naming conventions.

## Commits and pushes

Installation runs the root `prepare` script to register the hooks in `.vite-hooks/`. If a hook fails to run, check `vp hooks status` for the installed dispatcher at `.vite-hooks/_` and the three project hooks. Run `vp run prepare` to repeat setup. For runtime or package-manager problems, the global CLI provides `vp env doctor`.

- **Pre-commit** lints and formats staged JavaScript, TypeScript and Vue files under `apps/` and `packages/`, preserving unstaged edits. It merges duplicate imports and sorts named imports while preserving declaration order. Remove unused TypeScript imports manually. Use named exports in app and library source.
- **Commit-msg** validates Angular-style messages with commitlint. Use an imperative subject and an optional lowercase scope, for example `docs: document the developer workflow` or `fix(vite-app): update the counter label`.
- **Pre-push** runs package unit tests. A failure blocks the push. Use `vp run -r test` to reproduce it.

## Tooling decisions

- The Vite host runs its TypeScript check uncached because cached native compiler results could miss incompatible changes. Consumers import each library through its package entry point. Relative imports across packages still need an ownership rule.
- The UI controls and both palette viewers have colocated Storybook stories. Each preview loads its library’s default Sass entry. All three explorers share Canvas and Docs theme settings from `tooling/storybook/`. Vue template checks and component tests run through the workspace checks.
- Validate the packed library from a consumer before introducing a local registry such as Verdaccio. Release automation depends on a versioned artifact, owner and delivery target. The root test command supports CI once a provider is chosen.
