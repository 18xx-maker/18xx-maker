import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { svgPlugin } from "vite-plugin-fast-react-svg";
import { visualizer } from "rollup-plugin-visualizer";
import browserslistToEsbuild from "browserslist-to-esbuild";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  build: {
    target: browserslistToEsbuild(),
    rollupOptions: {
      onwarn: () => {},
      output: {
        manualChunks: {
          mui: [
            "@mui/material",
            "@mui/icons-material",
            "@mui/lab",
            "@mui/styles",
          ],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [react(), svgPlugin(), visualizer()],
  assetsInclude: ["**/*.md"],
  server: {
    open: true,
    port: 3000,
  },
});
