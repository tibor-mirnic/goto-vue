import { type Page, type Request, test as base, expect } from '@playwright/test';
import { createPaletteServers } from '../../../tooling/e2e/paletteServers.ts';

const aurora = '/api/palettes/aurora';
const mist = '/api/palettes/mist';
const realColors = ['indigo', 'harbor blue'];
const mockColors = ['coral', 'violet'];

const test = base.extend<{ servers: Awaited<ReturnType<typeof createPaletteServers>> }>({
  // oxlint-disable-next-line no-empty-pattern -- Playwright requires fixture dependency destructuring.
  servers: async ({}, use) => {
    const servers = await createPaletteServers('vite');
    try {
      await use(servers);
    } finally {
      await servers.close();
    }
  }
});

const openChooser = async (page: Page, origin: string) => {
  const requests: Request[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (request.method() === 'GET' && url.pathname.startsWith('/api/palettes/')) requests.push(request);
  });
  await page.goto(origin + '/palette');

  const main = page.getByRole('main');
  const picker = main.getByRole('combobox', { name: 'Palette', exact: true });
  const status = main.getByRole('status');
  const colors = main.getByRole('list', { name: 'Colors' });
  await expect(picker).toBeEnabled();
  await expect(picker).toHaveValue('');
  await expect(picker.locator('option:checked')).toHaveText('Choose a palette');
  await expect(status).toBeEmpty();
  await expect(colors).toHaveCount(0);
  expect(requests).toHaveLength(0);

  const expectReads = async (paths: string[], code: number | 'error' = 200, fromWorker = false) => {
    expect(requests.map((request) => request.url())).toEqual(paths.map((path) => origin + path));
    const response = await requests.at(-1)?.response();
    if (code === 'error') expect(response?.ok()).toBe(false);
    else expect(response?.status()).toBe(code);
    expect(response?.fromServiceWorker()).toBe(fromWorker);
  };
  return { main, picker, status, colors, expectReads };
};

const chooseBoth = async (page: Page, origin: string, expected: string[], fromWorker = false) => {
  const { picker, status, colors, expectReads } = await openChooser(page, origin);
  await picker.selectOption('aurora');
  await expect(colors.getByRole('listitem')).toHaveText(expected);
  await expectReads([aurora], 200, fromWorker);
  await picker.selectOption('mist');
  await expect(status).toHaveText('No colors in mist');
  await expect(colors).toHaveCount(0);
  await expectReads([aurora, mist], 200, fromWorker);
};

test('preview reads from Hono with the mock flag set', { tag: '@production' }, async ({ page, servers }) => {
  await servers.startApi();
  await servers.startWeb('production');
  await chooseBoth(page, servers.origin, realColors);
  const registrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
  expect(registrations).toBe(0);

  await servers.stopApi();
  const unavailable = await page.request.get(servers.origin + aurora);
  expect(unavailable.ok()).toBe(false);
});

test(
  'mock development survives an outage and the same origin returns to Hono',
  { tag: '@mock' },
  async ({ page, servers }) => {
    await servers.startWeb('mock');
    await expect(fetch(servers.apiUrl)).rejects.toMatchObject({ cause: { code: 'ECONNREFUSED' } });
    await chooseBoth(page, servers.origin, mockColors, true);

    await page.goto('about:blank');
    await servers.startWeb('off');
    await servers.startApi();
    await chooseBoth(page, servers.origin, realColors);
    await servers.stopApi();
    await expect(fetch(servers.apiUrl)).rejects.toMatchObject({ cause: { code: 'ECONNREFUSED' } });

    const { main, picker, status, colors, expectReads } = await openChooser(page, servers.origin);
    await picker.selectOption('aurora');
    await expect(status).toHaveText('Could not load aurora.');
    await expect(colors).toHaveCount(0);
    await expectReads([aurora], 'error');

    await servers.startApi();
    await main.getByRole('button', { name: 'Retry' }).click();
    await expect(colors.getByRole('listitem')).toHaveText(realColors);
    await expectReads([aurora, aurora]);
    await picker.selectOption('mist');
    await expect(status).toHaveText('No colors in mist');
    await expectReads([aurora, aurora, mist]);

    await page.goto('about:blank');
    await servers.startWeb('unset');
    await chooseBoth(page, servers.origin, realColors);
  }
);
