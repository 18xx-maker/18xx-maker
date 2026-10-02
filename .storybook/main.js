export default {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-onboarding", "@chromatic-com/storybook"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
