import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  Button,
  DropdownMenu,
  Fab,
  ListItemIcon,
  ListItemText,
  MenuDivider,
  MenuItem,
  Select,
  Tooltip,
  Train,
} from "@/ui";

import "./tokens.css";

// Popups portal to body, which is where the app sets the tokens
beforeAll(() => document.body.setAttribute("data-chrome-root", ""));
afterAll(() => document.body.removeAttribute("data-chrome-root"));

const style = (el) => getComputedStyle(el);

// Base UI keeps a closed select's listbox in the DOM, hidden
const visible = { hidden: false };
const closed = (box) => expect(box).toHaveAttribute("aria-expanded", "false");

const options = [
  { value: "gmt", label: "GMT" },
  { value: "dtg", label: "DTG" },
  { value: "moon", label: "Moon" },
];

// Controlled like the app uses it, onChange gets the MUI-like event
const Themes = ({ onChange = () => {}, ...props }) => {
  const [value, setValue] = useState("gmt");
  return (
    <Select
      id="theme"
      name="theme"
      label="Theme"
      value={value}
      options={options}
      onChange={(event) => {
        setValue(event.target.value);
        onChange(event);
      }}
      {...props}
    />
  );
};

describe("Select", () => {
  it("is a combobox named by its label and the selected text", () => {
    render(<Themes />);
    const box = screen.getByRole("combobox", { name: /^Theme/ });
    expect(box).toHaveTextContent("GMT");
    expect(box).toHaveAttribute("id", "theme");
    expect(box).toHaveAttribute("aria-labelledby", "theme-label theme");
    expect(screen.getByText("Theme")).toHaveAttribute("id", "theme-label");
  });

  it("can be named by a label elsewhere", () => {
    render(
      <>
        <span id="units-label">Margin</span>
        <Select
          id="units"
          labelId="units-label"
          value="mm"
          options={[{ value: "mm", label: "mm" }]}
          onChange={() => {}}
        />
      </>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-labelledby",
      "units-label units",
    );
  });

  it("opens a listbox under the field and selects with a click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Themes onChange={onChange} />);

    const box = screen.getByRole("combobox", { name: /^Theme/ });
    expect(box).toHaveAttribute("aria-expanded", "false");
    await user.click(box);

    const listbox = await screen.findByRole("listbox", visible);
    expect(box).toHaveAttribute("aria-expanded", "true");
    const items = screen.getAllByRole("option", visible);
    expect(items.map((o) => o.textContent)).toEqual(["GMT", "DTG", "Moon"]);
    expect(items.map((o) => o.getAttribute("data-value"))).toEqual([
      "gmt",
      "dtg",
      "moon",
    ]);
    expect(items[0]).toHaveAttribute("aria-selected", "true");

    // Under the field, at least as wide, on a paper
    const field = box.getBoundingClientRect();
    const popup = screen.getByTestId("select-popup");
    expect(popup).toContainElement(listbox);
    // Wait for the scale-in transition, the box is measured with it
    await waitFor(() =>
      expect(popup).not.toHaveAttribute("data-starting-style"),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rect = popup.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(field.bottom - 1);
    expect(rect.width).toBeGreaterThanOrEqual(field.width);
    expect(style(popup).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(style(popup).boxShadow).not.toBe("none");

    await user.click(screen.getByRole("option", { name: "Moon", ...visible }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target).toEqual({
      name: "theme",
      value: "moon",
    });
    await waitFor(() => closed(box));
    expect(box).toHaveTextContent("Moon");
    await waitFor(() => expect(box).toHaveFocus());
  });

  it("works from the keyboard: arrows, Enter, Escape and typeahead", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Themes onChange={onChange} />);

    const box = screen.getByRole("combobox", { name: /^Theme/ });
    await user.tab();
    expect(box).toHaveFocus();

    // Escape closes without a change and gives the focus back
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox", visible);
    await user.keyboard("{Escape}");
    await waitFor(() => closed(box));
    await waitFor(() => expect(box).toHaveFocus());
    expect(onChange).not.toHaveBeenCalled();

    // Arrow down from the selected option, Enter chooses
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox", visible);
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0].target.value).toBe("dtg");
    await waitFor(() => expect(box).toHaveTextContent("DTG"));
    await waitFor(() => expect(box).toHaveFocus());

    // Typing the start of an option jumps to it
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox", visible);
    await user.keyboard("m{Enter}");
    await waitFor(() => expect(box).toHaveTextContent("Moon"));
  });

  it("keeps the type of the option values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        id="variation"
        name="variation"
        label="Variation"
        value={0}
        options={[
          { value: 0, label: "First" },
          { value: 1, label: "Second" },
        ]}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("First");
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Second", ...visible }),
    );
    expect(onChange.mock.calls[0][0].target.value).toBe(1);
  });

  it("is invalid with error and has an outlined variant", () => {
    const { rerender } = render(<Themes error />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    rerender(<Themes variant="outlined" label={undefined} />);
    expect(screen.queryByText("Theme")).not.toBeInTheDocument();
    expect(style(screen.getByRole("combobox")).borderTopWidth).toBe("1px");
    // MUI's outlined select is 56px high, its text, 32px of arrow room and
    // 14px of padding on the sides, inside the border
    expect(screen.getByRole("combobox").getBoundingClientRect().height).toBe(
      56,
    );
    expect(style(screen.getByRole("combobox")).paddingRight).toBe("31px");
    expect(style(screen.getByRole("combobox")).paddingLeft).toBe("13px");
  });
});

const Menu = ({ onClose = () => {}, onPdf = () => {}, selected }) => {
  const [anchor, setAnchor] = useState(null);
  return (
    <div style={{ marginLeft: 200 }}>
      <Button onClick={(event) => setAnchor(event.currentTarget)}>Open</Button>
      <DropdownMenu
        id="menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => {
          setAnchor(null);
          onClose();
        }}
      >
        <MenuItem onClick={onPdf}>
          <ListItemIcon data-testid="menu-icon">
            <Train />
          </ListItemIcon>
          <ListItemText primary="All PDF" />
        </MenuItem>
        <MenuDivider />
        <MenuItem component="a" href="/docs" selected={selected}>
          <ListItemText primary="Docs" />
        </MenuItem>
        <MenuItem>
          <ListItemText primary="Other" />
        </MenuItem>
      </DropdownMenu>
    </div>
  );
};

describe("DropdownMenu", () => {
  it("opens over its button as a menu of items and a separator", async () => {
    const user = userEvent.setup();
    render(<Menu />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveAttribute("id", "menu");
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["All PDF", "Docs", "Other"]);
    expect(screen.getByRole("separator")).toBeInTheDocument();

    // Top right corner on the button's, on a paper (after the scale-in)
    await waitFor(() =>
      expect(menu).not.toHaveAttribute("data-starting-style"),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    const at = menu.getBoundingClientRect();
    const from = button.getBoundingClientRect();
    expect(Math.round(at.right)).toBe(Math.round(from.right));
    expect(Math.round(at.top)).toBe(Math.round(from.top));
    expect(style(menu).boxShadow).not.toBe("none");

    // Icons in a menu are 36px wide
    const icon = screen.getByTestId("menu-icon");
    expect(style(icon).minWidth).toBe("36px");
  });

  it("runs an item's click and closes", async () => {
    const user = userEvent.setup();
    const onPdf = vi.fn();
    const onClose = vi.fn();
    render(<Menu onPdf={onPdf} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(await screen.findByRole("menuitem", { name: "All PDF" }));
    expect(onPdf).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });

  it("works from the keyboard: arrows, Enter and Escape", async () => {
    const user = userEvent.setup();
    const onPdf = vi.fn();
    const onClose = vi.fn();
    render(<Menu onPdf={onPdf} onClose={onClose} />);

    const button = screen.getByRole("button", { name: "Open" });
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");

    // Arrows move through the items and wrap, Enter runs the highlighted one
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "All PDF" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Docs" })).toHaveFocus();
    await user.keyboard("{ArrowUp}{Enter}");
    expect(onPdf).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );

    // Escape closes and gives the focus back
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(button).toHaveFocus();
  });

  it("renders links, marking the current page", async () => {
    const user = userEvent.setup();
    render(<Menu selected />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const link = await screen.findByRole("menuitem", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: "Other" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(style(link).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});

describe("Tooltip", () => {
  // Room to the left, or the tooltip flips to the right
  const renderTip = () =>
    render(
      <div style={{ marginLeft: 200 }}>
        <Tooltip title="Print" aria-label="print" placement="left" arrow>
          <Fab data-testid="fab">
            <Train />
          </Fab>
        </Tooltip>
      </div>,
    );

  it("shows on keyboard focus and hides on Escape", async () => {
    const user = userEvent.setup();
    renderTip();

    const fab = screen.getByRole("button", { name: "print" });
    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();

    await user.tab();
    expect(fab).toHaveFocus();
    const tip = await screen.findByTestId("tooltip");
    expect(tip).toHaveTextContent("Print");
    expect(tip).toHaveAttribute("data-chrome", "tooltip");

    // Left of the button, a dark box 14px away with the white text
    const box = within(tip).getByText("Print");
    expect(box.getBoundingClientRect().right).toBeLessThanOrEqual(
      fab.getBoundingClientRect().left - 13,
    );
    expect(style(box).color).toBe("rgb(255, 255, 255)");
    expect(style(box).backgroundColor).toBe("rgba(97, 97, 97, 0.92)");
    expect(style(box).fontSize).toBe("11px");

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument(),
    );
    expect(fab).toHaveFocus();
  });

  it("shows on hover and leaves the button working", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <div style={{ marginLeft: 200 }}>
        <Tooltip title="Print" aria-label="print" placement="left">
          <Fab onClick={onClick}>
            <Train />
          </Fab>
        </Tooltip>
      </div>,
    );

    await user.hover(screen.getByRole("button", { name: "print" }));
    expect(await screen.findByTestId("tooltip")).toHaveTextContent("Print");
    await user.click(screen.getByRole("button", { name: "print" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.unhover(screen.getByRole("button", { name: "print" }));
    await waitFor(() =>
      expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("passes the ref and style on to its child, for a Slide around it", () => {
    const ref = { current: null };
    render(
      <Tooltip ref={ref} title="Print" style={{ marginTop: "3px" }}>
        <Fab data-testid="fab">
          <Train />
        </Fab>
      </Tooltip>,
    );
    expect(ref.current).toBe(screen.getByTestId("fab"));
    expect(screen.getByTestId("fab")).toHaveStyle({ marginTop: "3px" });
  });
});
