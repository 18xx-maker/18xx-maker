import exportCommand from "#cli/exportCommand";

// maker print is maker export --format pdf, with the paginated pdfs. The game
// argument has a default, which --all must not turn into a game and --all.
const command = (game, opts) =>
  exportCommand(opts?.all ? undefined : game, {
    ...opts,
    format: "pdf",
    paginated: true,
  });

export default command;
