import { createWriteStream } from "node:fs";

import { ZipArchive } from "archiver";

// Writes the zip of a Board 18 box (the names of b18Names) from its folder in
// out: board18-<game>-<version>.zip. Resolves when the file is closed. Node
// only.
export const writeZip = (out, names) =>
  new Promise((resolve, reject) => {
    const output = createWriteStream(`${out}/${names.zip}`);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(`${out}/${names.folder}`, names.folder);
    archive.finalize();
  });
