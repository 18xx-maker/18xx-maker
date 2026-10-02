import { defineConfig } from "@playwright/test";

// The real export paths, {CLI, app} x {pdf, png, b18}, on the builds in
// dist/site and dist/main (pnpm build && pnpm build:app). No preview server:
// the CLI serves the site itself and the app is launched by the specs. Run
// with `pnpm test:export`, in the "Export" job of CI on every OS.
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["export.spec.js", "cli.spec.js", "electron.spec.js"],
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { locale: "en-US", trace: "on-first-retry" },
  projects: [{ name: "export" }],
});
