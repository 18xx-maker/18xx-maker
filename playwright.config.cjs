const { defineConfig, devices } = require("@playwright/test");

// End to end tests run against the production build in dist/site, served by
// `vite preview`. Run `pnpm build` first (see DEVELOPMENT.md).
//
// This config and the specs are CommonJS (see e2e/package.json): Playwright
// 1.49 hangs forever loading ES modules on Node 24. Once Playwright is
// upgraded to 1.55 or newer these can become regular ES modules.
const PORT = 4318;

module.exports = defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.js",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "en-US",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort --no-open`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
