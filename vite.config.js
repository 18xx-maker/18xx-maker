import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { svgPlugin } from "vite-plugin-fast-react-svg";
import browserslistToEsbuild from "browserslist-to-esbuild";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  build: {
    target: browserslistToEsbuild(),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [react(), svgPlugin()],
  assetsInclude: ["**/*.md"],
  server: {
    open: true,
    port: 3000,
  },
});
