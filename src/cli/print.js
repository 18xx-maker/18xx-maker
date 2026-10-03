import exportCommand from "#cli/exportCommand";

// maker print is maker export --format pdf. The game
// argument has a default, which --all must not turn into a game and --all.
const command = (game, opts) =>
  exportCommand(opts?.all ? undefined : game, {
    ...opts,
    format: "pdf",
  });

export default command;
