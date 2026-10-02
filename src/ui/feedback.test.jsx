import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  Alert,
  AlertTitle,
  CircularProgress,
  Drawer,
  LinearProgress,
  Pagination,
  Slider,
  Snackbar,
} from "@/ui";
import { pageItems } from "./Pagination";

import "./tokens.css";

const renderChrome = (ui) => render(<div data-chrome-root>{ui}</div>);
const style = (el) => getComputedStyle(el);

describe("Alert", () => {
  it("shows the title and message, with the severity's colors", () => {
    renderChrome(
      <Alert severity="error">
        <AlertTitle>Oops</AlertTitle>
        It broke
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Oops");
    expect(alert).toHaveTextContent("It broke");
    // light shade lightened 90%, and the darkened text (the MUI standard look)
    expect(style(alert).backgroundColor).toBe(
      "color(srgb 0.993725 0.932549 0.931373)",
    );
    expect(style(alert).paddingTop).toBe("6px");
  });

  it("is role=alert whatever the severity, unless told otherwise", () => {
    renderChrome(
      <>
        <Alert severity="success">a</Alert>
        <Alert severity="info">b</Alert>
        <Alert severity="warning">c</Alert>
        <Alert severity="error">d</Alert>
        <Alert severity="info" role="note">
          e
        </Alert>
      </>,
    );
    expect(screen.getAllByRole("alert")).toHaveLength(4);
    expect(screen.getByRole("note")).toHaveTextContent("e");
  });
});

describe("Snackbar", () => {
  afterEach(() => vi.useRealTimers());

  it("renders nothing while closed", () => {
    renderChrome(
      <Snackbar open={false} data-testid="bar">
        <Alert>hi</Alert>
      </Snackbar>,
    );
    expect(screen.queryByTestId("bar")).not.toBeInTheDocument();
  });

  it("calls onClose after autoHideDuration, and never without one", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { rerender } = renderChrome(
      <Snackbar open autoHideDuration={4000} onClose={onClose}>
        <Alert>hi</Alert>
      </Snackbar>,
    );
    act(() => vi.advanceTimersByTime(3999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <div data-chrome-root>
        <Snackbar open onClose={onClose}>
          <Alert>hi</Alert>
        </Snackbar>
      </div>,
    );
    act(() => vi.advanceTimersByTime(60000));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape while open, with or without a timer", () => {
    const onClose = vi.fn();
    const { rerender } = renderChrome(
      <Snackbar open onClose={onClose}>
        <Alert>hi</Alert>
      </Snackbar>,
    );
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <div data-chrome-root>
        <Snackbar open={false} onClose={onClose}>
          <Alert>hi</Alert>
        </Snackbar>
      </div>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("pauses while hovered and restarts at half the time", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    renderChrome(
      <Snackbar
        open
        autoHideDuration={4000}
        onClose={onClose}
        data-testid="bar"
      >
        <Alert>hi</Alert>
      </Snackbar>,
    );
    fireEvent.mouseEnter(screen.getByTestId("bar"));
    act(() => vi.advanceTimersByTime(10000));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByTestId("bar"));
    act(() => vi.advanceTimersByTime(1999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("starts the timer again for a new key", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const bar = (key) => (
      <div data-chrome-root>
        <Snackbar key={key} open autoHideDuration={4000} onClose={onClose}>
          <Alert>{key}</Alert>
        </Snackbar>
      </div>
    );
    const { rerender } = render(bar("a"));
    act(() => vi.advanceTimersByTime(3000));
    rerender(bar("b"));
    act(() => vi.advanceTimersByTime(3000));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("progress", () => {
  it("LinearProgress is a progressbar with a value", async () => {
    renderChrome(<LinearProgress value={30} aria-label="Download" />);
    const bar = screen.getByRole("progressbar", { name: "Download" });
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(style(bar).height).toBe("4px");
    // The fill (the bar's only child) covers 30% once its transition is done
    // eslint-disable-next-line testing-library/no-node-access
    const fill = bar.firstChild;
    await waitFor(() =>
      expect(fill.getBoundingClientRect().right).toBeCloseTo(
        bar.getBoundingClientRect().left +
          bar.getBoundingClientRect().width * 0.3,
        0,
      ),
    );
  });

  it("CircularProgress is an indeterminate progressbar", () => {
    renderChrome(<CircularProgress aria-label="Checking" />);
    const bar = screen.getByRole("progressbar", { name: "Checking" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(style(bar).width).toBe("40px");
  });
});

describe("Pagination", () => {
  it.each([
    [1, 16, [1, 2, 3, 4, 5, "end-ellipsis", 16]],
    [8, 16, [1, "start-ellipsis", 7, 8, 9, "end-ellipsis", 16]],
    [16, 16, [1, "start-ellipsis", 12, 13, 14, 15, 16]],
    [3, 5, [1, 2, 3, 4, 5]],
    [1, 1, [1]],
    [1, 0, []],
  ])("page %i of %i shows the same pages as MUI", (page, count, items) => {
    expect(pageItems(page, count)).toEqual(items);
  });

  it("marks the current page and moves with the buttons", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          page={page}
          count={16}
          onChange={(_, value) => setPage(value)}
        />
      );
    };
    renderChrome(<Controlled />);
    const nav = screen.getByRole("navigation", {
      name: "pagination navigation",
    });

    expect(within(nav).getByRole("button", { name: "page 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      within(nav).getByRole("button", { name: "Go to previous page" }),
    ).toBeDisabled();

    await user.click(within(nav).getByRole("button", { name: "Go to page 3" }));
    expect(within(nav).getByRole("button", { name: "page 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    await user.click(
      within(nav).getByRole("button", { name: "Go to next page" }),
    );
    expect(within(nav).getByRole("button", { name: "page 4" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("has the large primary look", () => {
    renderChrome(<Pagination page={2} count={3} />);
    const current = screen.getByRole("button", { name: "page 2" });
    expect(style(current).minWidth).toBe("40px");
    expect(style(current).height).toBe("40px");
    expect(style(current).backgroundColor).toBe("rgb(94, 53, 177)");
  });
});

describe("Slider", () => {
  const Controlled = ({ onCommit }) => {
    const [value, setValue] = useState([0, 100]);
    return (
      <div style={{ width: 200 }}>
        <Slider
          value={value}
          onChange={setValue}
          onChangeCommitted={onCommit}
          step={10}
          min={0}
          max={100}
          marks={[
            { value: 0, label: "none" },
            { value: 50, label: "half" },
          ]}
          getAriaLabel={(i) => (i === 0 ? "Minimum" : "Maximum")}
        />
      </div>
    );
  };

  it("is a range slider whose thumbs move with the keyboard", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    renderChrome(<Controlled onCommit={onCommit} />);

    const min = screen.getByRole("slider", { name: "Minimum" });
    const max = screen.getByRole("slider", { name: "Maximum" });
    expect(min).toHaveValue("0");
    expect(max).toHaveValue("100");

    act(() => min.focus());
    await user.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(min).toHaveValue("20"));
    expect(onCommit).toHaveBeenLastCalledWith([20, 100], expect.anything());

    act(() => max.focus());
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(max).toHaveValue("90"));
  });

  it("labels the marks", () => {
    renderChrome(<Controlled />);
    expect(screen.getByText("none")).toBeInTheDocument();
    expect(screen.getByText("half")).toBeInTheDocument();
  });
});

describe("Drawer", () => {
  const Nav = ({ variant, initial = false }) => {
    const [open, setOpen] = useState(initial);
    return (
      <>
        <button onClick={() => setOpen(true)}>open</button>
        <Drawer
          variant={variant}
          open={open}
          onClose={() => setOpen(false)}
          data-testid="drawer"
        >
          <nav data-testid="content">
            <a href="#one">one</a>
            <a href="#two">two</a>
          </nav>
        </Drawer>
      </>
    );
  };

  it("permanent: always there, fixed to the left", () => {
    renderChrome(
      <Drawer variant="permanent" data-testid="drawer">
        <p data-testid="content">menu</p>
      </Drawer>,
    );
    // Fixed to the left edge, whatever is before it in the page
    expect(screen.getByTestId("content").getBoundingClientRect().left).toBe(0);
    expect(style(screen.getByText("menu")).visibility).toBe("visible");
    expect(screen.getByTestId("drawer")).toHaveAttribute(
      "data-chrome",
      "drawer",
    );
  });

  it("persistent: out of reach until it opens, no Escape, no focus move", async () => {
    const user = userEvent.setup();
    const Persistent = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(!open)}>toggle</button>
          <Drawer variant="persistent" anchor="right" open={open}>
            <button data-testid="inside">inside</button>
          </Drawer>
        </>
      );
    };
    renderChrome(<Persistent />);
    const inside = screen.getByTestId("inside");
    expect(style(inside).visibility).toBe("hidden");
    expect(
      screen.queryByRole("button", { name: "inside" }),
    ).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "toggle" });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "inside" })).toBeVisible();
    expect(toggle).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "inside" })).toBeVisible();
  });

  it("temporary: Escape and the backdrop close it, focus returns", async () => {
    const user = userEvent.setup();
    renderChrome(<Nav variant="temporary" />);
    const drawer = screen.getByTestId("drawer");
    // Closed: no links in the page, and the drawer is not reachable
    expect(screen.queryByRole("link", { name: "one" })).not.toBeInTheDocument();
    expect(style(drawer).visibility).toBe("hidden");

    const opener = screen.getByRole("button", { name: "open" });
    await user.click(opener);
    expect(screen.getByRole("link", { name: "one" })).toBeVisible();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(style(drawer).visibility).toBe("hidden"));
    expect(opener).toHaveFocus();

    await user.click(opener);
    expect(screen.getByRole("link", { name: "one" })).toBeVisible();
    // The backdrop is the drawer's first child
    // eslint-disable-next-line testing-library/no-node-access
    await user.click(drawer.firstChild);
    await waitFor(() => expect(style(drawer).visibility).toBe("hidden"));
    // The click left the focus on body, it still goes back to the opener
    expect(opener).toHaveFocus();
  });

  it("temporary: a named modal dialog that locks the page scroll", async () => {
    const user = userEvent.setup();
    const page = document.documentElement;
    page.style.overflow = "scroll";
    const { unmount } = renderChrome(
      <Drawer variant="temporary" open aria-label="Menu">
        <a href="#one">one</a>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(style(dialog).overscrollBehaviorY).toBe("contain");
    expect(style(page).overflow).toBe("hidden");
    unmount();
    expect(style(page).overflow).toBe("scroll");

    // closing it restores the scroll too
    renderChrome(<Nav variant="temporary" initial />);
    expect(style(page).overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(style(page).overflow).toBe("scroll");
    page.style.overflow = "";
  });

  it("temporary: a click on the panel keeps it open, Tab stays inside", async () => {
    const user = userEvent.setup();
    renderChrome(<Nav variant="temporary" initial />);
    const one = screen.getByRole("link", { name: "one" });
    const two = screen.getByRole("link", { name: "two" });

    await user.click(screen.getByTestId("content"));
    expect(one).toBeVisible();

    one.focus();
    await user.tab({ shift: true });
    expect(two).toHaveFocus();
    await user.tab();
    expect(one).toHaveFocus();
  });
});
