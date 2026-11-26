import { type Request, expect, test } from '@playwright/test';

test('loads palette colors only after a selection', async ({ page }) => {
  const paletteGets: Request[] = [];
  page.on('request', (request) => {
    if (request.method() === 'GET' && new URL(request.url()).pathname.startsWith('/api/palettes/')) {
      paletteGets.push(request);
    }
  });

  await page.goto('/palette');

  const main = page.getByRole('main');
  const picker = main.getByRole('combobox', { name: 'Palette', exact: true });
  const status = main.getByRole('status');
  const colorList = main.getByRole('list', { name: 'Colors' });
  await expect(picker).toBeEnabled();
  await expect(picker).toHaveValue('');
  await expect(picker.locator('option:checked')).toHaveText('Choose a palette');
  await expect(status).toBeEmpty();
  await expect(colorList).toHaveCount(0);
  expect(paletteGets).toHaveLength(0);

  const auroraUrl = new URL('/api/palettes/aurora.json', page.url()).href;
  const mistUrl = new URL('/api/palettes/mist.json', page.url()).href;

  await picker.selectOption('aurora');
  await expect(colorList.getByRole('listitem')).toHaveText(['indigo', 'harbor blue']);
  expect(paletteGets.map((request) => request.url())).toEqual([auroraUrl]);
  expect((await paletteGets[0]?.response())?.status()).toBe(200);

  await picker.selectOption('mist');
  await expect(status).toHaveText('No colors in mist');
  await expect(colorList).toHaveCount(0);
  expect(paletteGets.map((request) => request.url())).toEqual([auroraUrl, mistUrl]);
  expect((await paletteGets[1]?.response())?.status()).toBe(200);
});
