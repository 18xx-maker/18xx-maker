import { composeStories, setProjectAnnotations } from "@storybook/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import preview from "../.storybook/preview.jsx";

setProjectAnnotations(preview);

const files = import.meta.glob("../src/**/*.stories.@(js|jsx|mjs|ts|tsx)", {
  eager: true,
});

// Every story renders, so a story or the component it shows cannot rot
describe.each(Object.entries(files))("%s", (file, module) => {
  const stories = composeStories(module);

  it.each(Object.entries(stories))("%s renders", async (name, Story) => {
    const { container } = render(<Story />);

    // Stories are wrapped in an svg, so check that something is inside it
    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg.children.length).toBeGreaterThan(0);
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  });
});
