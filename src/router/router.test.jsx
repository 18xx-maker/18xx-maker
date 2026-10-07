import { act, render as rtlRender, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import {
  Link,
  Route,
  Router,
  Switch,
  useHash,
  useLocation,
  useMatch,
  useNavigate,
  useParams,
  useSearch,
} from "@/router";
import { formatPath, parsePath, resolveTo } from "@/router/url";

import { MemoryRouter } from "@tests/support/memoryRouter.jsx";

const user = userEvent.setup();

// The history is reset after the tree is gone, or it updates unmounted routers
let mounted;
const render = (ui) => (mounted = rtlRender(ui));
const reset = () => {
  mounted?.unmount();
  history.replaceState(null, "", location.pathname);
};

const Where = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <span data-testid="where">{JSON.stringify(location)}</span>
      <button onClick={() => navigate({ search: "z=1" })}>search</button>
      <button onClick={() => navigate({ search: "r=1" }, { replace: true })}>
        replace
      </button>
      <button onClick={() => navigate("/docs/x#heading")}>anchor</button>
      <button onClick={() => navigate(-1)}>back</button>
      <Link to={{ hash: "top" }}>top</Link>
      <Link to="/games/x?print=true">print</Link>
    </>
  );
};

const where = () => JSON.parse(screen.getByTestId("where").textContent);

describe("url helpers", () => {
  it("splits and joins a url", () => {
    expect(parsePath("/docs/x?a=1#h")).toEqual({
      pathname: "/docs/x",
      search: "?a=1",
      hash: "#h",
    });
    expect(parsePath("/x?")).toEqual({ pathname: "/x", search: "", hash: "" });
    expect(formatPath({ pathname: "/x", search: "a=1", hash: "h" })).toBe(
      "/x?a=1#h",
    );
  });

  it("keeps the current page for a target without a pathname", () => {
    const current = { pathname: "/games/x", search: "?old=1", hash: "" };
    expect(resolveTo("?a=1", current)).toBe("/games/x?a=1");
    expect(resolveTo({ hash: "top" }, current)).toBe("/games/x#top");
    expect(resolveTo({ search: "a=1" }, current)).toBe("/games/x?a=1");
    expect(resolveTo("/docs", current)).toBe("/docs");
  });
});

describe("hash router", () => {
  afterEach(reset);

  const renderHash = (hash) => {
    history.replaceState(null, "", `${location.pathname}${hash}`);
    return render(
      <Router hash>
        <Where />
        <Switch>
          <Route path="/games/:slug/*?">game</Route>
          <Route path="/docs/*?">docs</Route>
        </Switch>
      </Router>,
    );
  };

  it("reads the path, the query and the anchor of the hash", () => {
    renderHash("#/docs/games/tiles?print=true&config=true#heading");
    expect(where()).toEqual({
      pathname: "/docs/games/tiles",
      search: "?print=true&config=true",
      hash: "#heading",
    });
    expect(screen.getByText("docs")).toBeInTheDocument();
  });

  it("is the root without a hash", () => {
    renderHash("");
    expect(where()).toEqual({ pathname: "/", search: "", hash: "" });
  });

  it("keeps the query in the hash when it changes", async () => {
    renderHash("#/games/18Test/charters?print");
    await user.click(screen.getByText("search"));
    expect(location.hash).toBe("#/games/18Test/charters?z=1");
    expect(where().search).toBe("?z=1");
    expect(where().pathname).toBe("/games/18Test/charters");
  });

  it("replaces the entry when asked", async () => {
    renderHash("#/games/a");
    const length = history.length;
    await user.click(screen.getByText("replace"));
    expect(location.hash).toBe("#/games/a?r=1");
    expect(history.length).toBe(length);
    await user.click(screen.getByText("search"));
    expect(history.length).toBe(length + 1);
  });

  it("moves an anchor inside the hash", async () => {
    renderHash("#/docs/x?a=1");
    await user.click(screen.getByText("anchor"));
    expect(location.hash).toBe("#/docs/x#heading");
    expect(where().hash).toBe("#heading");
    expect(screen.getByText("top")).toHaveAttribute("href", "#/docs/x#top");
  });

  it("links with the hash in front", async () => {
    renderHash("#/docs/x");
    const link = screen.getByText("print");
    expect(link).toHaveAttribute("href", "#/games/x?print=true");
    await user.click(link);
    expect(location.hash).toBe("#/games/x?print=true");
    expect(screen.getByText("game")).toBeInTheDocument();
  });

  it("follows the browser history", async () => {
    renderHash("#/docs/x");
    await user.click(screen.getByText("print"));
    await act(async () => {
      history.back();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(where().pathname).toBe("/docs/x");
  });

  it("reads the search as it is (a value encoded twice)", () => {
    const Search = () => <span data-testid="s">{useSearch()}</span>;
    history.replaceState(null, "", `${location.pathname}#/x?a=b%2520c`);
    render(
      <Router hash>
        <Search />
      </Router>,
    );
    expect(screen.getByTestId("s")).toHaveTextContent("?a=b%2520c");
  });
});

describe("browser router", () => {
  afterEach(reset);

  it("reads the real search and anchor", async () => {
    const Search = () => (
      <>
        <span data-testid="s">{useSearch()}</span>
        <span data-testid="h">{useHash()}</span>
      </>
    );
    history.replaceState(null, "", `${location.pathname}?q=1#anchor`);
    render(
      <Router>
        <Search />
      </Router>,
    );
    expect(screen.getByTestId("s")).toHaveTextContent("?q=1");
    expect(screen.getByTestId("h")).toHaveTextContent("#anchor");
    await act(async () =>
      history.pushState(null, "", `${location.pathname}?q=2`),
    );
    expect(screen.getByTestId("s")).toHaveTextContent("?q=2");
    expect(screen.getByTestId("h")).toHaveTextContent("");
  });
});

describe("with the memory router", () => {
  const Params = () => {
    const params = useParams();
    const match = useMatch("/games/:slug/*");
    return <span data-testid="p">{JSON.stringify({ params, match })}</span>;
  };

  const renderAt = (url) =>
    render(
      <MemoryRouter initialEntries={[url]}>
        <Where />
        <Route path="/games/:slug/*?">
          <Params />
        </Route>
      </MemoryRouter>,
    );

  it("navigates with objects, anchors and back", async () => {
    renderAt("/games/18Test/map?print=true");
    await user.click(screen.getByText("search"));
    expect(where()).toEqual({
      pathname: "/games/18Test/map",
      search: "?z=1",
      hash: "",
    });
    await user.click(screen.getByText("top"));
    expect(where().hash).toBe("#top");
    expect(where().search).toBe("");
    await user.click(screen.getByText("back"));
    expect(where().search).toBe("?z=1");
  });

  it("matches a trailing slash and an encoded slug", () => {
    renderAt("/games/internal%3Aabc/");
    const { params, match } = JSON.parse(screen.getByTestId("p").textContent);
    expect(params.slug).toBe("internal:abc");
    expect(match.params.slug).toBe("internal:abc");
  });

  it("matches a slug with a colon and nothing after it", () => {
    renderAt("/games/internal:abc");
    expect(screen.getByTestId("p")).toHaveTextContent('"slug":"internal:abc"');
  });
});
