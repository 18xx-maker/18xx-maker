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
    let match = id.match(/src\/data\/logos\/(.*)\.svg/);
    if (match) {
      return `logo-${match[1].replace("/", "-")}`;
    }
    return "logos";
  }

  if (id.includes("src/data/games")) {
    let match = id.match(/src\/data\/games\/(.*)\.json/);
    if (match) {
      return `game-${match[1]}`;
    }
    return "games";
  }

  if (id.includes("src/data")) {
    return "data";
  }
};

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  build: {
    target: browserslistToEsbuild(),
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
