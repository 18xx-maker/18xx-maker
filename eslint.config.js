import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import jestDom from "eslint-plugin-jest-dom";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";

import pkg from "./package.json" with { type: "json" };

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    ignores: [
      "!.storybook",
      "browsers/",
      "coverage/",
      "docker/",
      "dist/",
      "playwright-report/",
      "public/",
      "test-results/",
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    settings: {
      react: {
        // Not "detect": eslint-plugin-react 7.37 calls an API that eslint 10
        // removed while detecting the version
        version: pkg.devDependencies.react,
      },
    },
  },
  react.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    // Only the classic hooks rules, the React Compiler rules in the plugin's
    // recommended set are not used since this project does not use the compiler
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
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
  ...storybook.configs["flat/recommended"],
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
