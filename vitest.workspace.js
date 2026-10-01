import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";
import { defineWorkspace } from "vitest/config";

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

export default defineWorkspace([
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
    // Integration tests run in a real browser (jsdom/Node disagree on
    // Request/AbortSignal, which react-router 7 needs)
    ...shared,
    test: {
      ...testShared,
      browser: {
        enabled: true,
        headless: true,
        name: "chromium",
        provider: "playwright",
        providerOptions: { context: { locale: "en-US" } },
        // A failure screenshot changes the browser zoom for later tests
        screenshotFailures: false,
      },
      include: ["tests/**/*.test.jsx", "src/**/*.test.jsx"],
      name: "component",
      setupFiles: ["tests/setup.js"],
    },
  },
]);
