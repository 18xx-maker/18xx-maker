import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "./helpers";

// 1858 has many tiles with more than one gauge, each its own group
const pageCount = async (tiles) => {
  renderApp("/games/1858/tiles", { config: { tiles } });
  const sheet = await screen.findByTestId("game-1858-tiles");
  // eslint-disable-next-line testing-library/no-node-access
  return sheet.querySelectorAll(".TileSheet--Page").length;
};

describe("offset tile sheet", () => {
  it("packs individual tiles instead of adding a blank row for each", async () => {
    expect(await pageCount({ layout: "offset" })).toBe(12);
  });
});

describe("offset tile sheet gaps setting", () => {
  it("still packs every tile when gaps are off", async () => {
    expect(await pageCount({ layout: "offset", gaps: false })).toBe(11);
  });
});
