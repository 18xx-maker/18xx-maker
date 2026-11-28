import { zipSync } from "fflate";

// Fixed so the same files always give the same bytes.
const MTIME = new Date(1980, 0, 1);

// Zip `{ path, bytes }` entries, in the given order.
export function zipFiles(files) {
  const entries = {};
  for (const { path, bytes } of files)
    entries[path] = [bytes, { mtime: MTIME }];
  return zipSync(entries);
}
