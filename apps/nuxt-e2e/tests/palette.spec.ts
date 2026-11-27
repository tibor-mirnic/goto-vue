import { type Page, type Request, test as base, expect } from '@playwright/test';
import { parse } from 'devalue';
import { createPaletteServers } from '../../../tooling/e2e/paletteServers.ts';

const aurora = '/api/palettes/aurora';
const mist = '/api/palettes/mist';
const ssrApi = '/api/palette-ssr';
const ssrAurora = ssrApi + '?name=aurora';
const ssrMist = ssrApi + '?name=mist';
const realColors = ['indigo', 'harbor blue'];
const mockColors = ['coral', 'violet'];

const test = base.extend<{ servers: Awaited<ReturnType<typeof createPaletteServers>> }>({
  // oxlint-disable-next-line no-empty-pattern -- Playwright requires fixture dependency destructuring.
  servers: async ({}, use) => {
    const servers = await createPaletteServers('nuxt');
    try {
      await use(servers);
    } finally {
      await servers.close();
    }
  }
});

const openPalette = async (page: Page, origin: string, route: '/palette' | '/palette-ssr') => {
  const requests: Request[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    const paletteRead = route === '/palette' ? pathname.startsWith('/api/palettes/') : pathname === ssrApi;
    if (paletteRead && request.method() === 'GET') requests.push(request);
  });

  await page.goto(origin + route);
  // Nuxt renders the picker before its event handler is attached.
  await page.waitForFunction(() => {
    const root = document.getElementById('__nuxt') as
      | (HTMLElement & { __vue_app__?: { $nuxt?: { isHydrating: boolean } } })
      | null;
    return root?.__vue_app__?.$nuxt?.isHydrating === false;
  });

  const main = page.getByRole('main');
  const picker = main.getByRole('combobox', { name: 'Palette', exact: true });
  const status = main.getByRole('status');
  const colors = main.getByRole('list', { name: 'Colors' });
  await expect(picker).toBeEnabled();
  expect(requests).toHaveLength(0);

  if (route === '/palette') {
    await expect(picker).toHaveValue('');
    await expect(picker.locator('option:checked')).toHaveText('Choose a palette');
    await expect(status).toBeEmpty();
    await expect(colors).toHaveCount(0);
  } else {
    await expect(picker).toHaveValue('aurora');
  }

  const expectReads = async (paths: string[], code = 200) => {
    expect(requests.map((request) => request.url())).toEqual(paths.map((path) => origin + path));
    const response = await requests.at(-1)?.response();
    expect(response?.status()).toBe(code);
    expect(response?.fromServiceWorker()).toBe(false);
  };
  return { picker, status, colors, expectReads, retry: main.getByRole('button', { name: 'Retry' }) };
};

const checkChooser = async (page: Page, origin: string, expected: string[]) => {
  const { picker, status, colors, expectReads } = await openPalette(page, origin, '/palette');
  await picker.selectOption('aurora');
  await expect(colors.getByRole('listitem')).toHaveText(expected);
  await expectReads([aurora]);
  await picker.selectOption('mist');
  await expect(status).toHaveText('No colors in mist');
  await expect(colors).toHaveCount(0);
  await expectReads([aurora, mist]);
};

const identity = (value: unknown) => value;

const checkRawSsr = async (page: Page, origin: string, expected?: string[]) => {
  const response = await page.request.get(origin + '/palette-ssr');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/html');

  const parser = await page.context().newPage();
  const html = await response.text();
  try {
    const rendered = await parser.evaluate((source) => {
      const raw = new DOMParser().parseFromString(source, 'text/html');
      const main = raw.querySelector('#__nuxt main');
      return {
        colors: Array.from(main?.querySelectorAll('li') ?? [], (item) => item.textContent),
        selected: main?.querySelector('select option[selected]')?.getAttribute('value'),
        status: main?.querySelector('[role="status"]')?.textContent,
        payload: raw.querySelector('#__NUXT_DATA__')?.textContent ?? ''
      };
    }, html);

    const payload = parse(rendered.payload, { ShallowReactive: identity, NuxtError: identity, Error: identity });
    expect(rendered.selected).toBe('aurora');
    expect(rendered.colors).toEqual(expected ?? []);
    if (expected) {
      expect(payload.data['palette-ssr']).toEqual({ palette: 'aurora', colors: expected });
    } else {
      expect(rendered.status?.trim()).toBe('Could not load aurora.');
      expect(payload.data?.['palette-ssr']).toBeUndefined();
      expect(payload._errors['palette-ssr'].statusCode).toBe(502);
    }
  } finally {
    await parser.close();
  }
};

const checkSsr = async (page: Page, origin: string, expected: string[]) => {
  await checkRawSsr(page, origin, expected);
  const view = await openPalette(page, origin, '/palette-ssr');
  await expect(view.colors.getByRole('listitem')).toHaveText(expected);
  await view.picker.selectOption('mist');
  await expect(view.status).toHaveText('No colors in mist');
  await expect(view.colors).toHaveCount(0);
  await view.expectReads([ssrMist]);
  await view.picker.selectOption('aurora');
  await expect(view.colors.getByRole('listitem')).toHaveText(expected);
  await view.expectReads([ssrMist, ssrAurora]);
  return view;
};

const checkInvalidQueries = async (page: Page, origin: string) => {
  for (const query of ['', '?name=', '?name=unknown', '?name=aurora&name=aurora', '?name=aurora&name=mist']) {
    const response = await page.request.get(origin + ssrApi + query);
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ statusMessage: 'Expected exactly one supported palette name' });
  }
};

const expectNoWorker = async (page: Page) => {
  const registrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
  expect(registrations).toBe(0);
};

test(
  'built Nitro uses Hono for the chooser and SSR with the mock flag set',
  { tag: '@production' },
  async ({ page, servers }) => {
    await servers.startApi();
    await servers.startWeb('production');
    await checkChooser(page, servers.origin, realColors);
    await checkSsr(page, servers.origin, realColors);
    await checkInvalidQueries(page, servers.origin);
    await expectNoWorker(page);

    await servers.stopApi();
    const chooser = await page.request.get(servers.origin + aurora);
    const ssr = await page.request.get(servers.origin + ssrAurora);
    expect(chooser.status()).toBe(502);
    expect(ssr.status()).toBe(502);
  }
);

test('mock development and outage recovery for the chooser and SSR', { tag: '@mock' }, async ({ page, servers }) => {
  const { origin, apiUrl } = servers;
  await servers.startWeb('mock');
  await expect(fetch(apiUrl)).rejects.toMatchObject({ cause: { code: 'ECONNREFUSED' } });
  const mockedSsr = await checkSsr(page, origin, mockColors);
  await page.route(origin + ssrMist, (route) => route.fulfill({ status: 503, json: { statusCode: 503 } }), {
    times: 1
  });
  await mockedSsr.picker.selectOption('mist');
  await expect(mockedSsr.status).toHaveText('Could not load mist.');
  await mockedSsr.expectReads([ssrMist, ssrAurora, ssrMist], 503);
  await mockedSsr.retry.click();
  await expect(mockedSsr.status).toHaveText('No colors in mist');
  await mockedSsr.expectReads([ssrMist, ssrAurora, ssrMist, ssrMist]);

  await checkChooser(page, origin, mockColors);
  await expectNoWorker(page);

  await page.goto('about:blank');
  await servers.startWeb('off');
  await servers.startApi();
  await checkSsr(page, origin, realColors);
  await servers.stopApi();

  await expect(fetch(apiUrl)).rejects.toMatchObject({ cause: { code: 'ECONNREFUSED' } });
  const apiResponse = await page.request.get(origin + ssrAurora);
  expect(apiResponse.status()).toBe(502);
  await checkInvalidQueries(page, origin);
  await checkRawSsr(page, origin);
  const ssr = await openPalette(page, origin, '/palette-ssr');
  await expect(ssr.status).toHaveText('Could not load aurora.');
  await expect(ssr.colors).toHaveCount(0);

  const chooserPage = await page.context().newPage();
  try {
    const chooser = await openPalette(chooserPage, origin, '/palette');
    await chooser.picker.selectOption('aurora');
    await expect(chooser.status).toHaveText('Could not load aurora.');
    await expect(chooser.colors).toHaveCount(0);
    await chooser.expectReads([aurora], 502);

    await servers.startApi();
    await ssr.retry.click();
    await expect(ssr.colors.getByRole('listitem')).toHaveText(realColors);
    await ssr.expectReads([ssrAurora]);
    await chooser.retry.click();
    await expect(chooser.colors.getByRole('listitem')).toHaveText(realColors);
    await chooser.expectReads([aurora, aurora]);
  } finally {
    await chooserPage.close();
  }

  await page.goto('about:blank');
  await servers.startWeb('unset');
  await checkChooser(page, origin, realColors);
  await checkSsr(page, origin, realColors);
  await expectNoWorker(page);
});
