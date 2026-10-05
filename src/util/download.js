import { omit } from "ramda";

import { titleToFilename } from "@/util";

// The game file as saved by the download button: the game without its meta
export const gameFile = (game) => ({
  data: omit(["meta"], game),
  filename: `${titleToFilename(game.info.title)}.json`,
});

// Saves the game file through a temporary link with a download attribute
export const downloadGame = (game) => {
  const { data, filename } = gameFile(game);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
