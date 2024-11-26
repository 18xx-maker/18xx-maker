import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["**/*.md"],
  json: {
    stringify: true,
  },
  plugins: [react(), svg()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    alias: {
      "@tests": path.resolve(import.meta.dirname, "tests"),
    },
    coverage: {
      cleanOnRerun: false,
      enabled: true,
      exclude: [
        "src/**/*.stories.*",
        "src/i18n.js",
        "src/index.jsx",
        "src/render/util.js",
        "src/schemas/**",
        ...coverageConfigDefaults.exclude,
      ],
      include: ["src/**"],
      reporter: process.env.CI ? "clover" : ["text-summary", "html"],
    },
    css: false,
    dir: "src",
    environmentMatchGlobs: [
      ["**/*.jsx", "jsdom"],
      ["**/*.js", "node"],
    ],
    globals: true,
    outputFile: "./junit.xml",
    reporters: process.env.CI ? ["junit", "default"] : "default",
    testTimeout: 30_000,
  },
});
