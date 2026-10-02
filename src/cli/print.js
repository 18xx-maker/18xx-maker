import exportCommand from "#cli/exportCommand";

// maker print is maker export --format pdf, with the paginated pdfs
const command = (game, opts) =>
  exportCommand(game, { ...opts, format: "pdf", paginated: true });

export default command;
