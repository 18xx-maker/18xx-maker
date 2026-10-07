import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";
import { matchedPattern, routePatterns } from "@tests/support/routes.js";
import { docs, docsUrl, routes, visitedUrls } from "@tests/support/smoke.js";

describe("route table", () => {
  it("has a smoke test URL for every route", () => {
    const visited = new Set(visitedUrls().map((url) => matchedPattern(url)));
    expect([...visited].sort()).toEqual(routePatterns().sort());
  });
});

describe("routes", () => {
  it.for(routes)("%s renders its page", async ([route, testId]) => {
    renderApp(route);
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
  });

  it("goes to the games list when a game does not exist", async () => {
    renderApp("/games/NotAGame/map");
    expect(await screen.findByTestId("games")).toBeInTheDocument();
  });

  it("has docs pages", () => {
    expect(docs).toContain("index");
  });

  it.for(["index", ...docs.filter((doc) => doc !== "index")])(
    "renders the %s docs page",
    async (doc) => {
      renderApp(docsUrl(doc));
      const page = await screen.findByTestId(`docs-${doc}`);
      expect(page).toBeInTheDocument();
      // A missing markdown file would render an empty page
      expect(page).toHaveTextContent(/\S/);
    },
  );
});

describe("unknown paths", () => {
  it("render Root with no page", async () => {
    renderApp("/nothing/here");
    // The sidebar button is Root's, there is no page and no error
    expect(
      await screen.findByRole("button", { name: "Toggle Sidebar" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("route-error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("home")).not.toBeInTheDocument();
  });

  it("match a trailing slash", async () => {
    renderApp("/games/18Test/map/");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
  });
});
