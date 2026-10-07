import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

const shared = {
  assetsInclude: ["**/*.md"],
  json: {
    stringify: true,
  },
  plugins: [react(), svg()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@tests": path.resolve(import.meta.dirname, "tests"),
    },
  },
};

const testShared = {
  css: false,
  globals: true,
  testTimeout: 30_000,
};

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        "src/**/*.stories.*",
        "src/stories/**",
        "src/**/__fixtures__/**",
        "src/i18n.js",
        "src/index.jsx",
        "src/render/util.js",
        "src/schemas/**",
        // Data and docs are not code, newer coverage tooling lists them when
        // they match the include
        "src/data/**",
        "src/**/*.{json,md,svg,css}",
        ...coverageConfigDefaults.exclude,
      ],
      include: ["src/**"],
      // Floors only apply in CI, a filtered local run covers only part of the
      // code and would fail them. A CI shard sees only part of the code too,
      // so the floors are checked when the shards' reports are merged.
      thresholds:
        process.env.CI && !process.env.VITEST_SHARD
          ? {
              // The state layer is pinned by src/state/*.test.js
              "src/state/**": { statements: 95 },
            }
          : undefined,
      reporter: process.env.CI ? "clover" : ["text-summary", "html"],
    },
    outputFile: { junit: "./junit.xml" },
    projects: [
      {
        ...shared,
        test: {
          ...testShared,
          environment: "node",
          include: ["src/**/*.test.js"],
          name: "unit",
        },
      },
      {
        // Integration tests run in a real browser (a DOM emulation and Node
        // disagree on Request/AbortSignal)
        ...shared,
        // Imported on demand by the app, pre-bundle them so that Vite does
        // not find them mid test and reload the page
        optimizeDeps: {
          include: [
            "json-schema-library",
            "@codemirror/autocomplete",
            "@codemirror/commands",
            "@codemirror/lang-json",
            "@codemirror/language",
            "@codemirror/lint",
            "@codemirror/search",
            "@codemirror/state",
            "@codemirror/view",
            "@lezer/highlight",
            "@replit/codemirror-emacs",
            "@replit/codemirror-vim",
            "shiki/core",
            "shiki/engine/javascript",
            "shiki/langs/bash.mjs",
            "shiki/langs/json.mjs",
            "shiki/themes/github-dark-default.mjs",
            "shiki/themes/github-light.mjs",
            "wouter",
            "wouter/memory-location",
            "wouter/use-browser-location",
          ],
        },
        test: {
          ...testShared,
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright({
              contextOptions: { locale: "en-US" },
            }),
            // A failure screenshot changes the browser zoom for later tests
            screenshotFailures: false,
          },
          include: ["tests/**/*.test.jsx", "src/**/*.test.jsx"],
          name: "component",
          setupFiles: ["tests/support/setup.js"],
        },
      },
    ],
    reporters: process.env.CI ? ["junit", "default"] : "default",
  },
});
