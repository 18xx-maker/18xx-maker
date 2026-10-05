// A game with a title, tiles and tokens only: no map, companies, stock market,
// trains or privates. No bundled game is this bare anymore, so tests of the
// pages that need such a game add it to the data index with
//
//   vi.mock("@/data/games", async (importOriginal) => {
//     const { withBareGame } = await import("@tests/support/bare.js");
//     return { default: withBareGame((await importOriginal()).default) };
//   });
export const bareGame = {
  meta: { id: "Bare", slug: "Bare", type: "bundled" },
  info: { title: "Bare", background: "gray", currency: "$#" },
  tokens: ["Round"],
  tiles: { 1: 1, 2: 1, 3: 2 },
};

export const withBareGame = (games) => ({ ...games, Bare: bareGame });
