import path from "node:path";

import { codecovVitePlugin as codecov } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import browserslistToEsbuild from "browserslist-to-esbuild";
import postcssNesting from "postcss-nesting";
import postcssPresetEnv from "postcss-preset-env";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";

const manualChunks = (id) => {
  // Setup ramda
  if (id.includes("ramda")) {
    return "ramda";
  }

  // All other vendor packages
  if (id.includes("node_modules")) {
    return "vendor";
  }

  // Group all logos by their group
  if (id.includes("src/data/logos")) {
    return "logos";
  }

  if (id.includes("src/data")) {
    return "data";
  }
};

export default defineConfig({
  assetsInclude: ["**/*.md"],
  base: "/",
  build: {
    target: browserslistToEsbuild(),
    reportCompressedSize: false,
    rollupOptions: {
      onwarn: () => {},
      output: {
        manualChunks,
      },
    },
  },
  css: {
    postcss: {
      plugins: [postcssNesting(), postcssPresetEnv({ env: "production" })],
    },
  },
  json: {
    stringify: true,
  },
  plugins: [
    react(),
    svg(),
    visualizer(),
    codecov({
      enableBundleAnalysis:
        process.env.CODECOV_TOKEN !== undefined &&
        process.env.CODECOV_TOKEN !== "",
      bundleName: "18xx-maker",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
