import { getRenderInput } from "@/util/renderInput";

export const GAME_PROBLEMS_RUNNING = "GAME_PROBLEMS_RUNNING";
export const GAME_PROBLEMS_DONE = "GAME_PROBLEMS_DONE";

export const createGameProblemsRunning = (slug) => ({
  type: GAME_PROBLEMS_RUNNING,
  slug,
});

export const createGameProblemsDone = (slug, issues) => ({
  type: GAME_PROBLEMS_DONE,
  slug,
  issues,
});

// The problems of the loaded game, found in the background. Never stored.
export const GAME_PROBLEMS_DEFAULT = { slug: null, status: "idle", issues: [] };

export const gameProblemsReducer = (state = GAME_PROBLEMS_DEFAULT, action) => {
  switch (action.type) {
    case GAME_PROBLEMS_RUNNING:
      // The last result stays while it is checked again, so the menu does not
      // flicker on every edit
      return {
        slug: action.slug,
        status: "running",
        issues: state.slug === action.slug ? state.issues : null,
      };
    case GAME_PROBLEMS_DONE:
      return { slug: action.slug, status: "done", issues: action.issues };
    default:
      return state;
  }
};

// The problems of the loaded game once they are known (the last ones while
// it is checked again)
export const selectGameProblems = (state, slug) =>
  state.gameProblems.slug === slug
    ? (state.gameProblems.issues ?? undefined)
    : undefined;

// Checks a game against the schema. The result is dropped when another game
// (or another version of this one) was loaded in the meantime. The checker
// loads on demand so it stays out of the first render.
export const validateLoadedGame = (game) => async (dispatch, getState) => {
  if (getRenderInput()) return;

  const slug = game.meta.slug;
  dispatch(createGameProblemsRunning(slug));

  let issues;
  try {
    const { validateGame } = await import("@/util/gameValidation");
    issues = await validateGame(game);
  } catch {
    issues = [{ severity: "warning", code: "failed", pointer: "", params: {} }];
  }

  if (getState().game === game) {
    dispatch(createGameProblemsDone(slug, issues));
  }
};
