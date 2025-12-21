import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --hostname 0.0.0.0 --port 3000',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
