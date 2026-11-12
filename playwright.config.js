import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'reproduction.spec.js',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4310' },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4310',
    reuseExistingServer: false,
  },
});
