import { render, screen } from "@testing-library/react";

import * as icons from "@/ui/icons";

describe("icons", () => {
  it("exports the 38 icons the app uses", () => {
    expect(Object.keys(icons)).toHaveLength(38);
  });

  it.each(Object.entries(icons))(
    "%s renders a decorative svg",
    (name, Icon) => {
      render(<Icon />);
      const svg = screen.getByTestId(`${name}Icon`);
      expect(svg.tagName).toBe("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).not.toBeEmptyDOMElement();
      // 1.5rem like MUI's default SvgIcon, from the CSS Module
      expect(getComputedStyle(svg).fontSize).toBe("24px");
      expect(svg.getBoundingClientRect().width).toBe(24);
    },
  );

  it("passes props and refs through", () => {
    const ref = { current: null };
    render(<icons.Train ref={ref} className="extra" data-testid="mine" />);
    expect(screen.getByTestId("mine")).toHaveClass("extra");
    expect(ref.current).toBe(screen.getByTestId("mine"));
  });
});
