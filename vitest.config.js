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
    reporters: process.env.CI ? ["junit", "default"] : "default",
  },
});
