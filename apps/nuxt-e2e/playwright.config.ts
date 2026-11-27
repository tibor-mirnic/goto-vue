import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: Boolean(process.env.CI),
  timeout: 180_000,
  workers: 1,
  use: { headless: true, trace: 'retain-on-failure' },
  projects: [
    { name: 'production', grep: /@production/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mock', grep: /@mock/, use: { ...devices['Desktop Chrome'] } }
  ]
});
