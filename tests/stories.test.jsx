import { composeStories, setProjectAnnotations } from "@storybook/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import preview from "../.storybook/preview.jsx";

setProjectAnnotations({
  ...preview,
  initialGlobals: preview.initialGlobals,
});

const files = import.meta.glob("../src/**/*.stories.js", { eager: true });

// Every story renders, so a story or the component it shows cannot rot
describe.each(Object.entries(files))("%s", (file, module) => {
  const stories = composeStories(module);

  it.each(Object.entries(stories))("%s renders", async (name, Story) => {
    const { container } = render(<Story />);

    expect(container).not.toBeEmptyDOMElement();
  });
});
