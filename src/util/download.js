import { omit } from "ramda";

import { titleToFilename } from "@/util";

// The game file as saved by the download button: the game without its meta
export const gameFile = (game) => ({
  data: omit(["meta"], game),
  filename: `${titleToFilename(game.info.title)}.json`,
});

// The text of the game file: what the download and a save write
export const gameText = (game) => JSON.stringify(gameFile(game).data, null, 2);

// Saves the game file through a temporary link with a download attribute
export const downloadGame = (game) => {
  const { filename } = gameFile(game);
  const url = URL.createObjectURL(
    new Blob([gameText(game)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
