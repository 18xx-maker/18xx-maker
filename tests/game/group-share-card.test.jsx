import { screen } from "@testing-library/react";

import { games } from "@/data";
import { compileCompanies } from "@/util/companies/companies";

import { renderApp } from "@tests/support/helpers.jsx";

// The share cards in the order of the share card route
const shares = compileCompanies(games["18Test"]).flatMap((c) =>
  (c.shares || []).map((s) => ({ abbrev: c.abbrev, ...s })),
);
const indexOf = (abbrev, president) =>
  shares.findIndex((s) => s.abbrev === abbrev && !!s.president === president);

describe("the share card route", () => {
  it("prints the group mark on the president's share", async () => {
    renderApp(`/games/18Test/cards/share/${indexOf("BRR", true)}`);
    await screen.findByTestId("game-18Test-card");
    expect(screen.getByTestId("group-mark-orange")).toBeInTheDocument();
  });

  it("prints no mark on another share of the same group", async () => {
    renderApp(`/games/18Test/cards/share/${indexOf("LRR", false)}`);
    await screen.findByTestId("game-18Test-card");
    expect(screen.queryByTestId(/^group-mark-/)).not.toBeInTheDocument();
  });
});
