import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import vitest from "eslint-plugin-vitest";
import jestDom from "eslint-plugin-jest-dom";
import testingLibrary from "eslint-plugin-testing-library";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { ignores: ["coverage/", "dist/", "out/", "public/"] },
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
    files: ["**/*.test.{js,jsx}"],
    plugins: { vitest },
    rules: vitest.configs.recommended.rules,
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  {
    files: ["**/*.test.{js,jsx}"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    files: ["**/*.test.{js,jsx}"],
    ...jestDom.configs["flat/recommended"],
  },
  {
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["bin/print.cjs"],
    rules: {
      "no-fallthrough": "off",
    },
  },
];
