import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import vitest from "eslint-plugin-vitest";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.test.js"],
    plugins: { vitest },
    rules: vitest.configs.recommended.rules,
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  {
    rules: {
      "react/prop-types": "off",
    },
  },
];
