import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const host = '127.0.0.1';
const port = 4174;
const baseURL = `http://${host}:${port}`;
const apiPort = 4176;
const apiOrigin = `http://${host}:${apiPort}`;

export default defineConfig({
  testDir: './tests',
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm run build && pnpm run start',
      cwd: fileURLToPath(new URL('../api', import.meta.url)),
      env: { HOST: host, PORT: String(apiPort) },
      url: `${apiOrigin}/api/palettes/aurora`,
      reuseExistingServer: false,
      timeout: 180_000
    },
    {
      command: 'pnpm exec vp run @goto/nuxt-app#build && node .output/server/index.mjs',
      cwd: fileURLToPath(new URL('../nuxt', import.meta.url)),
      env: { API_URL: apiOrigin, NITRO_HOST: host, NITRO_PORT: String(port) },
      url: `${baseURL}/palette`,
      reuseExistingServer: false,
      timeout: 180_000
    }
  ]
});
