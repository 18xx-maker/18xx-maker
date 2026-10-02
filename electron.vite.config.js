import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { svgPlugin as svg } from "vite-plugin-fast-react-svg";

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      lib: {
        entry: "./electron/main/index.js",
        format: "es",
      },
      rollupOptions: {
        output: {
          format: "cjs",
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      lib: {
        entry: "./electron/preload/preload.js",
        format: "cjs",
      },
      rollupOptions: {
        output: {
          format: "cjs",
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    assetsInclude: ["**/*.md"],
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: "index.html",
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
    root: "./",
  },
});
