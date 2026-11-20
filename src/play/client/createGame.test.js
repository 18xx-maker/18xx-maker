import { readFileSync } from "node:fs";

import { createGameBody } from "@/play/client/createGame";
import { validateGameJson } from "#cli/validate";

const file = JSON.parse(
  readFileSync(new URL("../../data/games/18Test.json", import.meta.url)),
);
// A game as the app holds it: the file plus the app's meta
const game = {
  meta: { id: "18Test", slug: "18Test", type: "bundled" },
  ...file,
};

describe("createGameBody", () => {
  it("posts the game file without the app's meta", () => {
    const body = createGameBody({
      game,
      config: { unit: "mm" },
      seatName: "Bob",
    });
    expect(body).toEqual({
      game: file,
      config: { unit: "mm" },
      seatName: "Bob",
    });
  });

  it("is a game the server's schema accepts", () => {
    expect(validateGameJson(game).valid).toBe(false);
    expect(validateGameJson(createGameBody({ game }).game).valid).toBe(true);
  });
});
