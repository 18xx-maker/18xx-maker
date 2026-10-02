import { render, screen } from "@testing-library/react";

import * as icons from "@/ui/icons";

import "../tokens.css";

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

  it("maps MUI's color prop to the palette tokens", () => {
    render(
      <div data-chrome-root>
        <icons.GetApp color="primary" data-testid="p" />
        <icons.GetApp color="secondary" data-testid="s" />
        <icons.Gavel color="error" data-testid="e" />
        <icons.Gavel fontSize="small" data-testid="small" />
      </div>,
    );
    expect(getComputedStyle(screen.getByTestId("p")).color).toBe(
      "rgb(94, 53, 177)",
    );
    expect(getComputedStyle(screen.getByTestId("s")).color).toBe(
      "rgb(255, 167, 38)",
    );
    expect(getComputedStyle(screen.getByTestId("e")).color).toBe(
      "rgb(211, 47, 47)",
    );
    expect(getComputedStyle(screen.getByTestId("small")).fontSize).toBe("20px");
  });
});
