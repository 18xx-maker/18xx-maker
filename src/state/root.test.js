import "@tests/support/windowStub.js";

import {
  clearAlert,
  createAlert,
  createDeleteGame,
  createDownloadPercent,
  createResetConfig,
  createResetErrors,
  createSetConfig,
  createSetErrors,
  createSetGame,
  createSetSummaries,
  createUpdate,
  rootReducer,
} from "@/state";

const game = (id, title) => ({
  info: { title, subtitle: "s", designer: "d", publisher: "p" },
  meta: { id, type: "system", slug: `system:${id}` },
  map: { hexes: [] },
});

// The root state is the contract between reducers and every consumer
// (useSelector calls, hooks, localStorage). A slice rewrite or a Redux upgrade
// must keep these snapshots identical.
describe("root state contract", () => {
  it("has a stable initial shape", () => {
    const { game, gameOriginal, loadedGame, update, ...rest } = rootReducer(
      undefined,
      {
        type: "@@init",
      },
    );
    // Consumers only rely on these being falsy
    expect(game).toBeFalsy();
    expect(gameOriginal).toBeFalsy();
    expect(loadedGame).toBeFalsy();
    expect(update).toBeFalsy();
    expect(rest).toMatchInlineSnapshot(`
      {
        "alert": {
          "items": [],
          "seq": 0,
        },
        "assets": {},
        "config": {},
        "errors": {},
        "gameHistory": [],
        "gameProblems": {
          "issues": [],
          "slug": null,
          "status": "idle",
        },
        "settings": {},
        "summaries": {},
        "ui": {
          "exportMenuOpen": false,
          "exportSheetOpen": false,
          "loadingGame": null,
          "panel": {},
        },
      }
    `);
  });

  it("keeps an equal state for an unknown action", () => {
    const state = rootReducer(undefined, { type: "@@init" });
    expect(rootReducer(state, { type: "@@unknown" })).toStrictEqual(state);
  });

  it("has a stable shape after a scripted sequence of real actions", () => {
    const actions = [
      createSetSummaries({
        bundled: { "bundled:1889": { id: "1889", title: "1889" } },
      }),
      createSetConfig({ theme: "cmk", paper: { width: 595 } }),
      createSetErrors({ "/paper/width": "must be number" }),
      createUpdate({ version: "2.0.0" }),
      createDownloadPercent(42),
      createSetGame(game("a", "Game A")),
      createAlert("Game Loaded", "System game Game A loaded", "success"),
      createSetGame(game("b", "Game B")),
      createDeleteGame("system:a"),
      clearAlert(),
    ];
    const state = actions.reduce(rootReducer, undefined);

    expect(state).toMatchInlineSnapshot(`
      {
        "alert": {
          "items": [],
          "seq": 1,
        },
        "assets": {},
        "config": {
          "paper": {
            "width": 595,
          },
          "theme": "cmk",
        },
        "errors": {
          "/paper/width": "must be number",
        },
        "game": {
          "info": {
            "designer": "d",
            "publisher": "p",
            "subtitle": "s",
            "title": "Game B",
          },
          "map": {
            "hexes": [],
          },
          "meta": {
            "id": "b",
            "slug": "system:b",
            "type": "system",
          },
        },
        "gameHistory": [],
        "gameOriginal": {
          "info": {
            "designer": "d",
            "publisher": "p",
            "subtitle": "s",
            "title": "Game B",
          },
          "map": {
            "hexes": [],
          },
          "meta": {
            "id": "b",
            "slug": "system:b",
            "type": "system",
          },
        },
        "gameProblems": {
          "issues": [],
          "slug": null,
          "status": "idle",
        },
        "loadedGame": {
          "designer": "d",
          "id": "b",
          "publisher": "p",
          "slug": "system:b",
          "subtitle": "s",
          "title": "Game B",
          "type": "system",
        },
        "settings": {},
        "summaries": {
          "bundled": {
            "bundled:1889": {
              "id": "1889",
              "title": "1889",
            },
          },
          "system": {
            "system:b": {
              "designer": "d",
              "id": "b",
              "publisher": "p",
              "slug": "system:b",
              "subtitle": "s",
              "title": "Game B",
              "type": "system",
            },
          },
        },
        "ui": {
          "exportMenuOpen": false,
          "exportSheetOpen": false,
          "loadingGame": null,
          "panel": {},
        },
        "update": {
          "downloading": 42,
          "version": "2.0.0",
        },
      }
    `);
  });

  it("deleting the loaded game clears game, loadedGame and its summary", () => {
    const state = [
      createSetGame(game("a", "Game A")),
      createDeleteGame("system:a"),
    ].reduce(rootReducer, undefined);
    expect(state.game).toBeFalsy();
    expect(state.loadedGame).toBeFalsy();
    expect(Object.keys(state.summaries.system)).toEqual([]);
  });

  it("resets config and errors", () => {
    const state = [
      createSetConfig({ theme: "cmk" }),
      createSetErrors({ a: "b" }),
      createResetConfig(),
      createResetErrors(),
    ].reduce(rootReducer, undefined);
    expect(state.config).toEqual({});
    expect(state.errors).toEqual({});
  });
});
