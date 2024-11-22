import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    reporters: process.env.CI ? ["junit", "default"] : ["default"],
    outputFile: "./junit.xml",
    setupFiles: "./setup-tests.js",
  },
});
