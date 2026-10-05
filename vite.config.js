import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { defineConfig } from "vite";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";

const manualChunks = (id) => {
  // Setup ramda
  if (id.includes("ramda")) {
    return "ramda";
  }

  // Only loaded on demand (json-schema-library by the config validation and
  // the highlighter by code blocks), leave them in their own async chunks
  if (
    /node_modules\/(\.pnpm\/[^/]+\/node_modules\/)?(json-schema-library|@hyperjump|@sagold|uri-js|valid-url|fast-copy|fast-deep-equal|shiki|@shikijs|oniguruma-to-es|oniguruma-parser|regex|regex-utilities|regex-recursion|hast-util-to-html|character-entities-html4|html-void-elements)\//.test(
      id,
    )
  ) {
    return;
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
    outDir: "dist/site",
    target: browserslistToEsbuild(),
    reportCompressedSize: false,
    rollupOptions: {
      onwarn: () => {},
      output: {
        manualChunks,
      },
    },
  },
  json: {
    stringify: true,
  },
  plugins: [react(), svg(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    open: false,
    port: 3000,
  },
});
