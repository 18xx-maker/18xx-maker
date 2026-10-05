import { diffLines } from "diff";

import { gameText } from "@/util/download";

const CONTEXT = 3;

const splitLines = (value) => {
  const lines = value.split("\n");
  // A change ends in a newline, which leaves an empty last piece
  if (lines.at(-1) === "") lines.pop();
  return lines;
};

// The line diff of two game texts as hunks with 3 lines of context. Every
// line is { type: "context" | "add" | "delete", text, oldLine, newLine } with
// the line number on the side(s) it exists on. `added` and `removed` count
// the changed lines.
export const diffText = (oldText, newText) => {
  const lines = [];
  let oldLine = 1;
  let newLine = 1;
  let added = 0;
  let removed = 0;

  for (const part of diffLines(oldText, newText)) {
    for (const text of splitLines(part.value)) {
      if (part.added) {
        lines.push({ type: "add", text, oldLine: null, newLine: newLine++ });
        added++;
      } else if (part.removed) {
        lines.push({ type: "delete", text, oldLine: oldLine++, newLine: null });
        removed++;
      } else {
        lines.push({
          type: "context",
          text,
          oldLine: oldLine++,
          newLine: newLine++,
        });
      }
    }
  }

  // Keep the changed lines and the context around them
  const keep = new Array(lines.length).fill(false);
  lines.forEach((line, i) => {
    if (line.type === "context") return;
    for (
      let j = Math.max(0, i - CONTEXT);
      j <= Math.min(lines.length - 1, i + CONTEXT);
      j++
    ) {
      keep[j] = true;
    }
  });

  const hunks = [];
  let current = null;
  lines.forEach((line, i) => {
    if (!keep[i]) {
      current = null;
      return;
    }
    if (!current) {
      current = [];
      hunks.push(current);
    }
    current.push(line);
  });

  return { hunks, added, removed };
};

// The diff of two games, the meta is not part of the file
export const diffGames = (original, edited) =>
  diffText(gameText(original), gameText(edited));
