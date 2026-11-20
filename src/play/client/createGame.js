import { omit } from "ramda";

// The body of POST /games for a game of the app: the game file without the
// meta the app adds (the server validates the game against the game schema,
// which does not allow it)
export const createGameBody = ({ game, config, seatName }) => ({
  game: omit(["meta"], game),
  config,
  seatName,
});
