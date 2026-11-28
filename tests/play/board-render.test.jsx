import { describe, expect, it, vi } from "vitest";

import { cell, drag, mount, svgOf, tap } from "@tests/support/playBoard.jsx";

// Counts the renders of the print drawing the board reuses
const { renders, counted } = vi.hoisted(() => {
  const renders = { map: 0, tile: 0, token: 0 };
  const counted = (key) => async (importOriginal) => {
    const { default: Original } = await importOriginal();
    const Counted = (props) => {
      renders[key] += 1;
      return <Original {...props} />;
    };
    return { default: Counted };
  };
  return { renders, counted };
});
vi.mock("@/components/map/Map", counted("map"));
vi.mock("@/components/Tile", counted("tile"));
vi.mock("@/components/tokens/GameMapCompanyToken", counted("token"));

const snapshot = () => ({ ...renders });
const log = [
  { type: "tile.place", hex: "B14", tile: "63", rotation: 1 },
  { type: "token.place", hex: "B12", token: "BLRR", x: 10, y: -5 },
];

describe("play board renders", () => {
  it("draws the print map, tiles and tokens again on no pan or zoom", async () => {
    const { board } = await mount({ log });
    const before = snapshot();
    expect(before.map).toBeGreaterThan(0);
    const box = svgOf(board).getAttribute("viewBox");
    drag(board, cell(board, "C13"), 40, 20);
    drag(board, cell(board, "C13"), -10, 5);
    expect(svgOf(board).getAttribute("viewBox")).not.toBe(box);
    expect(snapshot()).toEqual(before);
  });

  it("draws no tile again when a hex is selected", async () => {
    const { board } = await mount({ log });
    const before = snapshot();
    tap(board, cell(board, "C13"));
    expect(board.querySelector('[data-selected="C13"]')).toBeInTheDocument();
    expect(snapshot()).toEqual(before);
  });
});
