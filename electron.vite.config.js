import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react-swc";
import { svgPlugin } from "vite-plugin-fast-react-svg";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: "./electron/main/index.js",
        format: "es",
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: "./electron/preload/preload.js",
        format: "es",
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
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    plugins: [react(), svgPlugin()],
    root: "./",
  },
});
