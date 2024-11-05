import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
    svgr(),
  ],
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "object-hash": "object-hash/dist/object_hash.js",
    },
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
});
