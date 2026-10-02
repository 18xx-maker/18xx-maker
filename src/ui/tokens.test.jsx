import { render, screen } from "@testing-library/react";

import "./tokens.css";

import styles from "./coexistence.fixture.module.css";

const style = (el) => getComputedStyle(el);

describe("tokens and CSS Modules", () => {
  it("resolves the tokens inside the chrome root", () => {
    render(
      <div data-chrome-root>
        <span data-testid="chip" className={styles.chip}>
          chip
        </span>
      </div>,
    );

    // 8px spacing unit, copied palette
    expect(style(screen.getByTestId("chip")).paddingTop).toBe("16px");
    expect(style(screen.getByTestId("chip")).color).toBe("rgb(94, 53, 177)");
  });

  it("does not define tokens outside the chrome root", () => {
    render(<span data-testid="outside">x</span>);
    expect(
      style(screen.getByTestId("outside")).getPropertyValue("--space"),
    ).toBe("");
  });

  it("a :where() rule loses to any other rule, whatever the load order", () => {
    render(
      <span data-testid="el" className={`${styles.whereRed} ${styles.blue}`}>
        x
      </span>,
    );
    expect(style(screen.getByTestId("el")).color).toBe("rgb(0, 0, 255)");
  });
});
