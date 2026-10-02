import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  AppBar,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Container,
  Divider,
  Fab,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Train,
  Typography,
} from "@/ui";

import "./tokens.css";

const renderChrome = (ui) => render(<div data-chrome-root>{ui}</div>);
const style = (el) => getComputedStyle(el);

describe("Button", () => {
  it("is a native button that does not submit forms", async () => {
    const onClick = vi.fn();
    renderChrome(
      <Button startIcon={<Train />} onClick={onClick}>
        Go
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveAttribute("type", "button");
    expect(within(button).getByTestId("TrainIcon")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a link with an href", () => {
    renderChrome(<Button href="/x">Go</Button>);
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute(
      "href",
      "/x",
    );
  });

  it("disables a button, and a link with aria-disabled", () => {
    renderChrome(
      <>
        <Button disabled>Button</Button>
        <Button href="/x" disabled>
          Link
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Button" })).toBeDisabled();
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(style(link).pointerEvents).toBe("none");
  });

  it("styles the contained primary variant like MUI", () => {
    renderChrome(<Button variant="contained">Go</Button>);
    const css = style(screen.getByRole("button"));
    expect(css.backgroundColor).toBe("rgb(94, 53, 177)");
    expect(css.color).toBe("rgb(255, 255, 255)");
    expect(css.textTransform).toBe("uppercase");
  });
});

describe("IconButton and Fab", () => {
  it("are named by their aria-label", () => {
    renderChrome(
      <>
        <IconButton aria-label="menu">
          <Train />
        </IconButton>
        <Fab aria-label="print" data-testid="fab">
          <Train />
        </Fab>
      </>,
    );
    expect(screen.getByRole("button", { name: "menu" })).toBeVisible();
    expect(screen.getByRole("button", { name: "print" })).toBeVisible();
  });

  it("gives the fab its print hook and size", () => {
    renderChrome(<Fab aria-label="print" />);
    const fab = screen.getByRole("button");
    expect(fab).toHaveAttribute("data-chrome", "fab");
    expect(style(fab).width).toBe("56px");
  });
});

describe("AppBar", () => {
  it("is a banner with the print hook, in the primary color", () => {
    renderChrome(
      <AppBar position="sticky">
        <Toolbar>title</Toolbar>
      </AppBar>,
    );
    const bar = screen.getByRole("banner");
    expect(bar).toHaveAttribute("data-chrome", "app-bar");
    expect(style(bar).position).toBe("sticky");
    expect(style(bar).backgroundColor).toBe("rgb(94, 53, 177)");
  });
});

describe("text", () => {
  it("maps variants to elements", () => {
    renderChrome(
      <>
        <Typography variant="h5">five</Typography>
        <Typography>body</Typography>
        <Typography variant="caption">small</Typography>
        <Typography component="h1">one</Typography>
      </>,
    );
    expect(
      screen.getByRole("heading", { name: "five", level: 5 }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "one", level: 1 }),
    ).toBeVisible();
    expect(screen.getByText("body").localName).toBe("p");
    expect(screen.getByText("small").localName).toBe("span");
    expect(style(screen.getByText("body")).margin).toBe("0px");
  });

  it("renders links and dividers", () => {
    renderChrome(
      <>
        <Link href="/x" underline="none">
          there
        </Link>
        <Divider />
      </>,
    );
    expect(screen.getByRole("link", { name: "there" })).toHaveAttribute(
      "href",
      "/x",
    );
    expect(style(screen.getByRole("link")).textDecorationLine).toBe("none");
    expect(screen.getByRole("separator")).toBeVisible();
  });
});

describe("List", () => {
  it("renders rows, buttons and links with their text", () => {
    renderChrome(
      <List>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <Train />
            </ListItemIcon>
            <ListItemText primary="Title" secondary="More" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="/x" disabled>
            <ListItemText>Link</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Title/ })).toHaveTextContent(
      "More",
    );
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

describe("Table", () => {
  it("has header cells in the head and cells in the body", () => {
    renderChrome(
      <TableContainer component={Paper}>
        <Table size="small" aria-label="things">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Train</TableCell>
              <TableCell align="right">4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>,
    );
    expect(screen.getByRole("table", { name: "things" })).toBeVisible();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "4" })).toBeVisible();
    expect(style(screen.getByRole("cell", { name: "4" })).textAlign).toBe(
      "right",
    );
    expect(style(screen.getByRole("cell", { name: "Train" })).padding).toBe(
      "6px 16px",
    );
  });
});

describe("layout", () => {
  it("sizes grid items by breakpoint and gap", () => {
    renderChrome(
      <div style={{ width: 316 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }} data-testid="a">
            a
          </Grid>
          <Grid size={{ xs: 6 }} data-testid="b">
            b
          </Grid>
        </Grid>
      </div>,
    );
    expect(screen.getByTestId("a").getBoundingClientRect().width).toBe(150);
    expect(screen.getByTestId("b").getBoundingClientRect().width).toBe(150);
  });

  it("renders containers, paper and avatars", () => {
    renderChrome(
      <Container maxWidth="md" data-testid="container">
        <Paper elevation={5} data-testid="paper">
          <AvatarGroup>
            <Avatar variant="square" data-testid="avatar">
              a
            </Avatar>
          </AvatarGroup>
        </Paper>
      </Container>,
    );
    expect(["16px", "24px"]).toContain(
      style(screen.getByTestId("container")).paddingLeft,
    );
    expect(style(screen.getByTestId("paper")).boxShadow).not.toBe("none");
    expect(style(screen.getByTestId("avatar")).borderRadius).toBe("0px");
  });
});

describe("form controls", () => {
  it("toggle by clicking the label, with a name from the label", async () => {
    const onChange = vi.fn();
    renderChrome(
      <FormGroup>
        <FormControlLabel
          label="Privates"
          control={<Checkbox checked={false} onChange={onChange} />}
        />
        <FormControlLabel
          label="Paginated"
          control={<Switch checked onChange={onChange} />}
        />
      </FormGroup>,
    );
    const box = screen.getByRole("checkbox", { name: "Privates" });
    expect(box).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Paginated" })).toBeChecked();

    await userEvent.click(screen.getByText("Privates"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("draw a checked checkbox in the primary color", () => {
    renderChrome(
      <>
        <Checkbox checked onChange={() => {}} aria-label="on" />
        <Checkbox checked={false} onChange={() => {}} aria-label="off" />
      </>,
    );
    expect(
      style(screen.getByRole("checkbox", { name: "on" })).backgroundColor,
    ).toBe("rgb(94, 53, 177)");
    expect(
      style(screen.getByRole("checkbox", { name: "off" })).backgroundColor,
    ).toBe("rgba(0, 0, 0, 0)");
  });

  it("colors the ring and shows a focus ring by sibling selectors", async () => {
    const user = userEvent.setup();
    renderChrome(
      <>
        <Checkbox checked onChange={() => {}} aria-label="on" />
        <Checkbox checked={false} onChange={() => {}} aria-label="off" />
        <Checkbox checked disabled onChange={() => {}} aria-label="gone" />
      </>,
    );
    const ring = (name) =>
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByRole("checkbox", { name }).nextElementSibling;
    expect(style(ring("on")).color).toBe("rgb(94, 53, 177)");
    expect(style(ring("off")).color).toBe("rgba(0, 0, 0, 0.6)");
    expect(style(ring("gone")).color).toBe("rgba(0, 0, 0, 0.26)");
    expect(style(screen.getByRole("checkbox", { name: "gone" })).color).toBe(
      "rgba(0, 0, 0, 0.26)",
    );

    expect(style(ring("on")).outlineStyle).toBe("none");
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "on" })).toHaveFocus();
    expect(style(ring("on")).outlineStyle).toBe("solid");
  });

  it("names a group by its legend", () => {
    renderChrome(
      <fieldset>
        <FormLabel component="legend">Show</FormLabel>
        <FormGroup>
          <FormControlLabel label="A" control={<Checkbox />} />
        </FormGroup>
      </fieldset>,
    );
    expect(screen.getByRole("group", { name: "Show" })).toBeVisible();
  });
});

describe("TextField", () => {
  it("is a native input named by its label, with the label id", () => {
    renderChrome(
      <TextField id="margin" label="Margin" value="1" onChange={() => {}} />,
    );
    expect(screen.getByRole("textbox", { name: "Margin" })).toHaveValue("1");
    expect(screen.getByText("Margin")).toHaveAttribute("id", "margin-label");
  });

  it("floats the label when focused or filled", async () => {
    renderChrome(
      <>
        <TextField id="a" label="Empty" defaultValue="" />
        <TextField id="b" label="Full" defaultValue="x" />
      </>,
    );
    const rest = style(screen.getByText("Empty")).transform;
    expect(style(screen.getByText("Full")).transform).not.toBe(rest);
    expect(rest).toBe("matrix(1, 0, 0, 1, 12, 16)");

    await userEvent.click(screen.getByRole("textbox", { name: "Empty" }));
    // The label moves with a transition
    await waitFor(() =>
      expect(style(screen.getByText("Empty")).transform).toBe(
        style(screen.getByText("Full")).transform,
      ),
    );
  });

  it("marks an error with aria-invalid and the error color", () => {
    renderChrome(
      <>
        <TextField id="a" label="Bad" error defaultValue="" />
        <TextField id="b" label="Good" defaultValue="" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Bad" })).toBeInvalid();
    expect(screen.getByRole("textbox", { name: "Good" })).toBeValid();
    expect(style(screen.getByText("Bad")).color).toBe("rgb(211, 47, 47)");
    expect(style(screen.getByText("Good")).color).not.toBe("rgb(211, 47, 47)");
  });
});
