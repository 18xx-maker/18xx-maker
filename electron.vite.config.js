import path from "node:path";
import postcssNesting from "postcss-nesting";
import postcssPresetEnv from "postcss-preset-env";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { svgPlugin } from "vite-plugin-fast-react-svg";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: "./electron/main/index.js",
        format: "es",
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
      lib: {
        entry: "./electron/preload/preload.js",
        format: "es",
      },
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
  },
  renderer: {
    assetsInclude: ["**/*.md"],
    build: {
      rollupOptions: {
        input: "index.html",
      },
    },
    css: {
      postcss: {
        plugins: [postcssNesting(), postcssPresetEnv({ env: "app" })],
      },
    },
    json: {
      stringify: true,
    },
    plugins: [react(), svgPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: "./",
  },
});
