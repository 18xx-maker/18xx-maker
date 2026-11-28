import { defineConfig, devices } from "@playwright/test";

// End to end tests run against the production build in dist/site, served by
// `vite preview`. Run `pnpm build` first (see DEVELOPMENT.md).
const PORT = 4318;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.js",
  // The real export paths and the CLI specs run in their own jobs, with
  // playwright.export.config.js (pnpm test:export)
  testIgnore: ["export.spec.js", "cli*.spec.js"],
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "en-US",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `pnpm exec vite preview --port ${PORT} --strictPort --no-open`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    // The play server of e2e/play.spec.js, which is skipped without a database
    ...(process.env.DATABASE_URL
      ? [
          {
            command: "node e2e/support/play-server.mjs",
            url: "http://127.0.0.1:4319/health",
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
            // SIGTERM lets it drop its schema
            gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
          },
        ]
      : []),
  ],
});
