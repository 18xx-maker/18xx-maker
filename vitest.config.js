import { coverageConfigDefaults, defineConfig } from "vitest/config";

// Project definitions (unit / component) live in vitest.workspace.js
export default defineConfig({
  test: {
    coverage: {
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
    outputFile: "./junit.xml",
    reporters: process.env.CI ? ["junit", "default"] : "default",
  },
});
