import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { svgPlugin } from "vite-plugin-fast-react-svg";
import { visualizer } from "rollup-plugin-visualizer";
import browserslistToEsbuild from "browserslist-to-esbuild";

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
