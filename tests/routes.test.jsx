import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";
import { coveredRoutes, routePatterns } from "@tests/routes.js";

const docs = Object.keys(
  import.meta.glob("../src/docs/**/*.en.md", { eager: false }),
).map((file) => file.replace("../src/docs/", "").replace(/\.en\.md$/, ""));

describe("route table", () => {
  it("has a smoke test for every route", () => {
    expect(routePatterns().sort()).toEqual(Object.keys(coveredRoutes).sort());
  });
});

describe("routes", () => {
  it.for([
    ["/", "home"],
    ["/elements", "atoms"],
    ["/elements/tiles", "tiles"],
    ["/elements/logos", "logos"],
    ["/games", "games"],
    // The app page is electron only, everyone else goes home
    ["/app", "home"],
  ])("%s renders its page", async ([route, testId]) => {
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
      renderApp(doc === "index" ? "/docs" : `/docs/${doc}`);
      const page = await screen.findByTestId(`docs-${doc}`);
      expect(page).toBeInTheDocument();
      // A missing markdown file would render an empty page
      expect(page).toHaveTextContent(/\S/);
    },
  );
});
