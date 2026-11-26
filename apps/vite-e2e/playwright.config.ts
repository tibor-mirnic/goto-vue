import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const host = '127.0.0.1';
const port = 4173;
const baseURL = `http://${host}:${port}`;
const apiPort = 4175;
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
      url: `${apiOrigin}/api/palettes/aurora.json`,
      reuseExistingServer: false,
      timeout: 180_000
    },
    {
      command: `pnpm exec vp run @goto/vite-app#build && pnpm run preview --host ${host} --port ${port} --strictPort`,
      cwd: fileURLToPath(new URL('../vite', import.meta.url)),
      env: { API_URL: apiOrigin },
      url: `${baseURL}/palette`,
      reuseExistingServer: false,
      timeout: 180_000
    }
  ]
});
