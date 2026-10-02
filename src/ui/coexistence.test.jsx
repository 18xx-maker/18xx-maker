import { render, screen } from "@testing-library/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { deepPurple } from "@mui/material/colors";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";

import { renderApp } from "@tests/helpers";

import "./tokens.css";

import styles from "./coexistence.fixture.module.css";

const theme = createTheme({ palette: { primary: { main: deepPurple[600] } } });

const renderChrome = (ui) =>
  render(
    <div data-chrome-root data-testid="root">
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </StyledEngineProvider>
    </div>,
  );

const style = (el) => getComputedStyle(el);

describe("CSS Modules next to MUI", () => {
  it("resolves tokens and matches the MUI primary color", () => {
    renderChrome(
      <>
        <span data-testid="chip" className={styles.chip}>
          chip
        </span>
        <Button color="primary">mui</Button>
      </>,
    );

    // 8px spacing unit, copied palette
    expect(style(screen.getByTestId("chip")).paddingTop).toBe("16px");
    const token = style(screen.getByTestId("chip")).color;
    expect(token).toBe("rgb(94, 53, 177)");
    expect(style(screen.getByRole("button", { name: "mui" })).color).toBe(
      token,
    );
  });

  it("does not define tokens outside the chrome root", () => {
    render(<span data-testid="outside">x</span>);
    expect(
      style(screen.getByTestId("outside")).getPropertyValue("--space"),
    ).toBe("");
  });

  it("CSS Modules beat MUI emotion styles (injectFirst)", () => {
    renderChrome(
      <Box
        data-testid="box"
        sx={{ color: "rgb(0, 0, 255)" }}
        className={styles.red}
      >
        box
      </Box>,
    );
    expect(style(screen.getByTestId("box")).color).toBe("rgb(255, 0, 0)");
  });

  it("JSS makeStyles beats CSS Modules at equal specificity", () => {
    // The real Viewport sets overflow: auto with makeStyles. The fixture sets
    // overflow: hidden on the same element with one attribute selector, which
    // has the same specificity as one class.
    renderApp("/");
    expect(style(screen.getByTestId("viewport")).overflow).toBe("auto");
  });

  it("a :where() rule loses to any other rule", () => {
    renderChrome(
      <Box
        data-testid="box"
        sx={{ color: "rgb(0, 0, 255)" }}
        className={styles.whereRed}
      >
        box
      </Box>,
    );
    expect(style(screen.getByTestId("box")).color).toBe("rgb(0, 0, 255)");
  });
});
