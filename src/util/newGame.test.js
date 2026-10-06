import { validateGame } from "@/util/gameValidation";
import { newGameJson } from "#util/newGame";

describe("newGameJson", () => {
  const game = JSON.parse(newGameJson("My Game"));

  it("has the title and 16 unique plain hexes", () => {
    expect(game.info).toEqual({ title: "My Game" });
    expect(game.map.hexes).toHaveLength(1);
    expect(game.map.hexes[0].color).toBe("plain");
    expect(new Set(game.map.hexes[0].hexes).size).toBe(16);
  });

  it("is written like a downloaded game", () => {
    expect(newGameJson("My Game")).toBe(JSON.stringify(game, null, 2));
  });

  it("is a valid game", async () => {
    expect(await validateGame(game)).toEqual([]);
  });
});
