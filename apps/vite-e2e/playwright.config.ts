import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const host = '127.0.0.1';
const port = 4173;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests',
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec vp run @goto/vite-app#build && pnpm run preview --host ${host} --port ${port} --strictPort`,
    cwd: fileURLToPath(new URL('../vite', import.meta.url)),
    url: `${baseURL}/palette`,
    reuseExistingServer: false,
    timeout: 180_000
  }
});
