import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  AppBar,
  Avatar,
  AvatarGroup,
  Button,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
