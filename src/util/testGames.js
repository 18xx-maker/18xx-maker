// Bundled games that exist for testing, not to play. 18Broken has schema
// errors on purpose, so it is not validated by the CLI or CI.
export const TEST_GAMES = ["18Test", "18Broken"];

export const isTestGame = (id) => TEST_GAMES.includes(id);

// The ones the validate command skips
export const UNVALIDATED_GAMES = ["18Broken"];
