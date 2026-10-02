import exportCommand from "#cli/exportCommand";

// maker b18 is maker export --format b18
const command = (game, version, author, opts) =>
  exportCommand(game, {
    ...opts,
    format: "b18",
    b18Version: version,
    b18Author: author,
  });

export default command;
