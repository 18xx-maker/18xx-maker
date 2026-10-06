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

    // Stories of the print output are wrapped in an svg, check that something
    // is inside it. The stories of the interface are not drawn in one.
    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    // Something the component draws: a control for the interface, whose
    // stories are not in an svg
    const drawn = container.querySelector(
      Story.parameters?.chrome
        ? "[role], input, button, select, textarea, [data-slot]"
        : "svg > *",
    );
    expect(drawn).not.toBeNull();
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  });
});
