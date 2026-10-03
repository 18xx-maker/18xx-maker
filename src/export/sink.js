import fs from "node:fs";
import path from "node:path";

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

// A sink that writes files in a folder. A path that leaves the folder is an
// error. Node only.
export const createFileSink = (root) => ({
  write: (relPath, bytes) => {
    const file = insideFolder(root, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  },
});
