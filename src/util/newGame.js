// A new game file: the title and a 4 by 4 block of plain hexes to start the map
// from. Plain ES module whose only import is the import-free title module, the
// app and the Electron main process both use it (#util/newGame).
import { titleToFilename } from "./titleFilename.js";

const HEXES = [
  "A1",
  "A3",
  "A5",
  "A7",
  "B2",
  "B4",
  "B6",
  "B8",
  "C1",
  "C3",
  "C5",
  "C7",
  "D2",
  "D4",
  "D6",
  "D8",
];

// The text of the file, written like the download button writes a game
export const newGameJson = (title) =>
  JSON.stringify(
    { info: { title }, map: { hexes: [{ color: "plain", hexes: HEXES }] } },
    null,
    2,
  );

// The suggested file name for a title: its lowercase letters and digits, or
// "new-game" for a title with none (a Chinese title would give "-")
export const newGameFilename = (title) => {
  const slug = titleToFilename(title);
  return /[a-z0-9]/.test(slug) ? slug : "new-game";
};
