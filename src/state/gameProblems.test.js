// @vitest-environment jsdom

import { configureStore } from "@reduxjs/toolkit";

import {
  createGameProblemsDone,
  createGameProblemsRunning,
  createSetGame,
  gameProblemsReducer,
  rootReducer,
  selectGameProblems,
  validateLoadedGame,
} from "@/state";
import * as renderInput from "@/util/renderInput";

import { brokenGame, validGame } from "@tests/support/brokenGame.js";

const makeStore = () => configureStore({ reducer: rootReducer });

describe("gameProblems", () => {
  afterEach(() => vi.restoreAllMocks());

  it("starts idle and ignores other actions", () => {
    const state = gameProblemsReducer(undefined, { type: "@@init" });
    expect(state).toEqual({ slug: null, status: "idle", issues: [] });
    expect(gameProblemsReducer(state, { type: "@@other" })).toBe(state);
  });

  it("goes running then done", () => {
    const running = gameProblemsReducer(
      undefined,
      createGameProblemsRunning("a"),
    );
    expect(running).toEqual({ slug: "a", status: "running", issues: [] });
    expect(
      gameProblemsReducer(running, createGameProblemsDone("a", [1])),
    ).toEqual({ slug: "a", status: "done", issues: [1] });
  });

  it("selects the problems only when done and for the same game", () => {
    const state = (gameProblems) => ({ gameProblems });
    const done = { slug: "a", status: "done", issues: [1] };
    expect(selectGameProblems(state(done), "a")).toEqual([1]);
    expect(selectGameProblems(state(done), "b")).toBeUndefined();
    expect(
      selectGameProblems(state({ ...done, status: "running" }), "a"),
    ).toBeUndefined();
  });

  it("finds the problems of the loaded game", async () => {
    const store = makeStore();
    store.dispatch(createSetGame(brokenGame()));
    const game = store.getState().game;

    const promise = store.dispatch(validateLoadedGame(game));
    expect(store.getState().gameProblems.status).toBe("running");
    await promise;

    expect(store.getState().gameProblems.status).toBe("done");
    expect(selectGameProblems(store.getState(), "Broken")).toHaveLength(5);
  });

  it("finds nothing in a valid game", async () => {
    const store = makeStore();
    store.dispatch(createSetGame(validGame()));
    await store.dispatch(validateLoadedGame(store.getState().game));
    expect(selectGameProblems(store.getState(), "Valid")).toEqual([]);
  });

  it("drops the result when another game was loaded meanwhile", async () => {
    const store = makeStore();
    store.dispatch(createSetGame(brokenGame()));
    const game = store.getState().game;
    const promise = store.dispatch(validateLoadedGame(game));
    store.dispatch(createSetGame(validGame()));
    await promise;

    expect(store.getState().gameProblems.status).toBe("running");
  });

  it("drops the result when the same game was loaded again", async () => {
    const store = makeStore();
    store.dispatch(createSetGame(brokenGame()));
    const game = store.getState().game;
    const promise = store.dispatch(validateLoadedGame(game));
    store.dispatch(createSetGame({ ...game }));
    await promise;

    expect(store.getState().gameProblems.status).toBe("running");
  });

  it("does nothing in render mode", async () => {
    vi.spyOn(renderInput, "getRenderInput").mockReturnValue({});
    const store = makeStore();
    store.dispatch(createSetGame(brokenGame()));
    await store.dispatch(validateLoadedGame(store.getState().game));

    expect(store.getState().gameProblems.status).toBe("idle");
  });
});
