import fs from "node:fs";
import path from "node:path";

import { safeName } from "./names.js";

// The absolute path of relPath in root. A path that leaves the folder is an
// error. Node only.
export const insideFolder = (root, relPath) => {
  const file = path.resolve(root, relPath);
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${relPath} is outside of ${root}`);
  }
  return file;
};

// The folder of a game in the output folder, named by the game id. Node only.
export const gameFolder = (root, id) => path.join(root, safeName(id));

// A sink that writes files in a folder. A path that leaves the folder is an
// error. Node only.
export const createFileSink = (root) => ({
  write: (relPath, bytes) => {
    const file = insideFolder(root, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  },
});
