import { maxPlayers } from "./index";

describe("Cards", () => {
  it("Can compute the max number of players from the players object", () => {
    const players = [{ number: 2 }, { number: 3 }, { number: 5 }];

    expect(maxPlayers(players)).toEqual(5);
  });
});
