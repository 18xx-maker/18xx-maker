import browserslistToEsbuild from "browserslist-to-esbuild";
import path from "node:path";
import postcssNesting from "postcss-nesting";
import postcssPresetEnv from "postcss-preset-env";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { svgPlugin } from "vite-plugin-fast-react-svg";
import { visualizer } from "rollup-plugin-visualizer";

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
  plugins: [react(), svgPlugin(), visualizer()],
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
