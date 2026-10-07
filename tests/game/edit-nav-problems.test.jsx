import { act, screen, waitFor, within } from "@testing-library/react";

import {
  createGameProblemsDone,
  createGameProblemsRunning,
} from "@/state/gameProblems";

import { renderApp } from "@tests/support/helpers.jsx";

const issue = (pointer, code = "type") => ({
  severity: "error",
  code,
  pointer,
  params: {},
});

const open = async (route = "/games/18Test/map?edit=true") => {
  const view = renderApp(route);
  await screen.findByTestId("edit-panel");
  // The check of the loaded game ends before the test sets its own result
  await waitFor(() =>
    expect(view.store.getState().gameProblems.status).toBe("done"),
  );
  return view;
};

const tab = (name) => screen.getByRole("tab", { name: new RegExp(name) });
const set = (store, issues) =>
  act(() => store.dispatch(createGameProblemsDone("18Test", issues)));

describe("edit panel tabs with problems", () => {
  it("marks the tab of each problem with a counted dot", async () => {
    const { store } = await open();
    await set(store, [
      issue("trains[0].name"),
      issue("trains[2]"),
      issue("stock.type"),
      issue("revenue.min"),
      issue("tokenTypes[1].cost"),
    ]);

    expect(tab("Trains")).toHaveAccessibleName("Trains 2 problems");
    expect(tab("Market")).toHaveAccessibleName("Market 1 problem");
    expect(tab("Output")).toHaveAccessibleName("Output 1 problem");
    expect(tab("Tokens")).toHaveAccessibleName("Tokens 1 problem");
    expect(screen.getByTestId("edit-problem-trains")).toBeInTheDocument();
    expect(tab("Game")).toHaveAccessibleName("Game");
    expect(tab("Colors")).toHaveAccessibleName("Colors");
  });

  it("has no dot while the check runs again (unknown)", async () => {
    const { store } = await open();
    await set(store, [issue("trains[0].name")]);
    expect(screen.getByTestId("edit-problem-trains")).toBeInTheDocument();

    // A check of another game: the result of this one is not known
    await act(() => store.dispatch(createGameProblemsRunning("Other")));
    expect(screen.queryByTestId("edit-problem-trains")).not.toBeInTheDocument();
    expect(tab("Trains")).toHaveAccessibleName("Trains");
  });

  it("leaves out a deprecated note and a check that failed", async () => {
    const { store } = await open();
    await set(store, [
      issue("trains[0].name", "deprecated"),
      issue("", "failed"),
    ]);
    expect(
      within(screen.getByRole("tablist", { name: "Equipment" })).queryByTestId(
        "edit-problem-trains",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(/edit-problem-/)).not.toBeInTheDocument();
  });

  it("marks the hex tab for the selected group only", async () => {
    const { store } = await open("/games/18Test/map?edit=true&hex=A11");
    await set(store, [
      issue("map.hexes[0].color"),
      issue("map.hexes[1].color"),
    ]);
    expect(tab("Hex")).toHaveAccessibleName("Hex 1 problem");

    await set(store, [issue("map.hexes[1].color")]);
    expect(tab("Hex")).toHaveAccessibleName("Hex");
  });
});
