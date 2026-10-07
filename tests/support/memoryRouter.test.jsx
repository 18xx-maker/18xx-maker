import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Route, Switch, useLocation, useSearch } from "wouter";

import {
  RouterProvider,
  createMemoryRouter,
} from "@tests/support/memoryRouter.jsx";

const Where = () => {
  const [path, navigate] = useLocation();
  const search = useSearch();
  return (
    <>
      <span data-testid="where">{`${path}|${search}`}</span>
      <button onClick={() => navigate("/b?x=1")}>push</button>
      <button onClick={() => navigate("/c", { replace: true })}>replace</button>
    </>
  );
};

const user = userEvent.setup();

const setup = (entries, index) => {
  const router = createMemoryRouter(entries, index);
  render(
    <RouterProvider router={router}>
      <Where />
      <Switch>
        <Route path="/a">a page</Route>
        <Route path="/b">b page</Route>
      </Switch>
    </RouterProvider>,
  );
  return router;
};

describe("memory router", () => {
  it("starts at the given entry as a POP", () => {
    const router = setup(["/", "/a?q=2"], 1);
    expect(screen.getByTestId("where")).toHaveTextContent("/a|q=2");
    expect(screen.getByText("a page")).toBeInTheDocument();
    expect(router.state.location).toEqual({
      pathname: "/a",
      search: "?q=2",
      hash: "",
    });
    expect(router.state.historyAction).toBe("POP");
  });

  it("tracks push and replace made by the app", async () => {
    const router = setup(["/a"]);
    await act(async () => user.click(screen.getByText("push")));
    expect(screen.getByTestId("where")).toHaveTextContent("/b|x=1");
    expect(router.state.location.pathname).toBe("/b");
    expect(router.state.location.search).toBe("?x=1");
    expect(router.state.historyAction).toBe("PUSH");

    await act(async () => user.click(screen.getByText("replace")));
    expect(router.state.location.pathname).toBe("/c");
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("goes back and forward as a POP", async () => {
    const router = setup(["/", "/a"], 1);
    await act(async () => user.click(screen.getByText("push")));
    await act(async () => router.navigate(-1));
    expect(screen.getByTestId("where")).toHaveTextContent("/a|");
    expect(router.state.historyAction).toBe("POP");
    await act(async () => router.navigate(-1));
    expect(router.state.location.pathname).toBe("/");
    await act(async () => router.navigate(1));
    expect(router.state.location.pathname).toBe("/a");
    // Pushing drops the forward entries
    await act(async () => user.click(screen.getByText("push")));
    await act(async () => router.navigate(1));
    expect(router.state.location.pathname).toBe("/b");
  });

  it("navigates from a test with a url or a search object", async () => {
    const router = setup(["/a?old=1"]);
    await act(async () => router.navigate({ search: "?edit=true" }));
    expect(screen.getByTestId("where")).toHaveTextContent("/a|edit=true");
    expect(router.state.location.search).toBe("?edit=true");
    await act(async () => router.navigate("/b#top"));
    expect(router.state.location).toEqual({
      pathname: "/b",
      search: "",
      hash: "#top",
    });
  });
});
