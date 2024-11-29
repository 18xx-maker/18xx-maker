import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import browserslistToEsbuild from "browserslist-to-esbuild";
import tailwindcss from "tailwindcss";
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
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer({ end: "production" })],
    },
  },
  json: {
    stringify: true,
  },
  plugins: [react(), svg()],
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
