import "@tests/support/windowStub.js";

import { configureStore } from "@reduxjs/toolkit";

import {
  createSetGame,
  rootReducer,
  selectAlerts,
  selectGameProblems,
  validateLoadedGame,
} from "@/state";

import { validGame } from "@tests/support/brokenGame.js";

vi.mock("@/util/gameValidation", () => ({
  validateGame: () => Promise.reject(new Error("could not compile")),
}));

describe("gameProblems when the check fails", () => {
  it("reports one warning, never an alert", async () => {
    const store = configureStore({ reducer: rootReducer });
    store.dispatch(createSetGame(validGame()));
    await store.dispatch(validateLoadedGame(store.getState().game));

    expect(selectGameProblems(store.getState(), "Valid")).toEqual([
      { severity: "warning", code: "failed", pointer: "", params: {} },
    ]);
    expect(selectAlerts(store.getState())).toEqual([]);
  });
});
