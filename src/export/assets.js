import nodeFs from "node:fs";
import path from "node:path";

import {
  KINDS,
  KIND_EXTENSION,
  MAX_FILES,
  MAX_PNG_BYTES,
  MAX_SVG_BYTES,
  MAX_TOTAL_BYTES,
  PNG_DATA_URI,
  assetBytes,
  assetProblem,
  assetsFolder,
  emptyAssets,
  extensionOf,
  findDuplicate,
  nameProblem,
  pngDataUri,
} from "#util/assetNames";

// The custom images of a game file, read from <game>.assets/ (see
// util/assetNames). Node only: the CLI and the main process of the app use it,
// the page is given the result (render mode `input.assets`).
//
// Nothing in the folder is trusted: every level is looked at with lstat and a
// link is skipped, only .svg (icons, logos) and .png (trains) are read, names
// follow the id rule, sizes and the PNG header are checked, and the number
// and total size of the files is capped. A file that is not taken is a
// warning, not an error.

// The root of a document must be <svg, after an XML declaration, comments and
// white space
const SVG_ROOT = /^\s*(?:<\?xml[^>]*\?>\s*|<!--[\s\S]*?-->\s*)*<svg[\s>/]/;
// What an icon or logo never needs and the page's sanitizer would drop. The
// page always sanitizes; this keeps such a file from being stored at all.
const SVG_DENIED =
  /<script|<foreignObject|<!ENTITY|\son[a-z]+\s*=|javascript:/i;

// Why the bytes are not an SVG document, or null: "encoding" (not UTF-8),
// "root" (no <svg element) or "unsafe". Gives the text on success.
export const svgText = (bytes) => {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { problem: "encoding" };
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (!SVG_ROOT.test(text)) return { problem: "root" };
  if (SVG_DENIED.test(text)) return { problem: "unsafe" };
  return { text };
};

// Everything about an image of `kind` that can be known from its bytes: the
// name, size, PNG header and SVG root. Gives { problem } or { value } (the SVG
// text or the PNG data URI of an asset map).
export const readAsset = (kind, name, bytes) => {
  const problem = assetProblem(kind, name, bytes);
  if (problem) return { problem };
  if (kind === "trains") return { value: pngDataUri(bytes) };
  const { text, problem: svgProblem } = svgText(bytes);
  return svgProblem ? { problem: svgProblem } : { value: text };
};

// The O_NOFOLLOW flag where the system has it, so a file that was swapped for
// a link between the lstat and the read is not followed
const NOFOLLOW = nodeFs.constants.O_NOFOLLOW ?? 0;

const lstatOrNull = (fs, file) => {
  try {
    return fs.lstatSync(file);
  } catch (e) {
    if (e?.code === "ENOENT" || e?.code === "ENOTDIR") return null;
    throw e;
  }
};

// The whole file as bytes, not following a link, or null when it is no
// regular file or too big
const readSmallFile = (fs, file, limit) => {
  const fd = fs.openSync(file, nodeFs.constants.O_RDONLY | NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > limit) return null;
    const bytes = Buffer.alloc(stat.size);
    let read = 0;
    while (read < bytes.length) {
      const n = fs.readSync(fd, bytes, read, bytes.length - read, read);
      if (n === 0) break;
      read += n;
    }
    return bytes.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
};

// The images of the folder `root`: { assets, warnings, count }. A folder that
// is not there has no images and no warnings.
export const loadAssetsFrom = (root, { fs = nodeFs } = {}) => {
  const assets = emptyAssets();
  const warnings = [];
  const warn = (file, why) => warnings.push(`${path.join(root, file)}: ${why}`);
  let count = 0;
  let total = 0;

  let rootStat;
  try {
    rootStat = lstatOrNull(fs, root);
  } catch (e) {
    warnings.push(`${root}: ${e.message}`);
    return { assets, warnings, count };
  }
  if (!rootStat) return { assets, warnings, count };
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    warnings.push(`${root}: not a folder, ignored`);
    return { assets, warnings, count };
  }

  for (const kind of KINDS) {
    const dir = path.join(root, kind);
    let dirStat;
    let entries;
    try {
      dirStat = lstatOrNull(fs, dir);
      if (!dirStat) continue;
      if (dirStat.isSymbolicLink() || !dirStat.isDirectory()) {
        warn(kind, "not a folder, ignored");
        continue;
      }
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      warn(kind, e.message);
      continue;
    }

    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const file = path.join(kind, entry.name);
      if (entry.name.startsWith(".")) continue;
      if (entry.isSymbolicLink()) {
        warn(file, "links are ignored");
        continue;
      }
      if (!entry.isFile()) {
        warn(file, "not a file, ignored");
        continue;
      }
      const extension = extensionOf(entry.name);
      if (extension !== KIND_EXTENSION[kind]) {
        warn(file, `only .${KIND_EXTENSION[kind]} files are used here`);
        continue;
      }
      const name = entry.name.slice(0, -(extension.length + 1));
      const named = nameProblem(name);
      if (named) {
        warn(file, `the name is not usable (${named})`);
        continue;
      }
      if (findDuplicate(Object.keys(assets[kind]), name)) {
        warn(file, "same name as another file without regard to case");
        continue;
      }
      if (count >= MAX_FILES) {
        warn(file, `more than ${MAX_FILES} files`);
        continue;
      }

      let bytes;
      try {
        bytes = readSmallFile(
          fs,
          path.join(dir, entry.name),
          kind === "trains" ? MAX_PNG_BYTES : MAX_SVG_BYTES,
        );
      } catch (e) {
        warn(file, e.code === "ELOOP" ? "links are ignored" : e.message);
        continue;
      }
      if (!bytes) {
        warn(file, "not a file or too big");
        continue;
      }
      const { value, problem } = readAsset(kind, name, bytes);
      if (problem) {
        warn(file, `not a valid image (${problem})`);
        continue;
      }
      if (total + bytes.length > MAX_TOTAL_BYTES) {
        warn(file, "the images are over the total size limit");
        continue;
      }
      assets[kind][name] = value;
      count += 1;
      total += bytes.length;
    }
  }

  return { assets, warnings, count };
};

// The images of a game file: <game>.assets/ next to "/games/x.json"
export const loadAssetFolder = (gamePath, options) =>
  loadAssetsFrom(assetsFolder(gamePath), options);

const isPlainObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

// Why an asset map that came from a page (a request to export a game that
// has no folder) is not acceptable, or null: its shape, names, sizes and
// counts are capped like a folder's. The page sanitizes the SVG itself.
export const assetsProblem = (assets) => {
  if (!isPlainObject(assets)) return "not an object";
  let count = 0;
  let total = 0;
  for (const kind of Object.keys(assets)) {
    if (!KINDS.includes(kind)) return `unknown kind ${kind}`;
    const map = assets[kind];
    if (!isPlainObject(map)) return `${kind} is not an object`;
    for (const name of Object.keys(map)) {
      const value = map[name];
      const named = nameProblem(name);
      if (named) return `${kind}/${name}: the name is not usable (${named})`;
      if (typeof value !== "string") return `${kind}/${name}: not text`;
      if (kind === "trains") {
        if (!PNG_DATA_URI.test(value)) return `${kind}/${name}: not a PNG`;
      }
      const size = assetBytes(kind, value);
      if (size > (kind === "trains" ? MAX_PNG_BYTES : MAX_SVG_BYTES)) {
        return `${kind}/${name}: too big`;
      }
      count += 1;
      total += size;
      if (count > MAX_FILES) return `more than ${MAX_FILES} files`;
      if (total > MAX_TOTAL_BYTES) return "over the total size limit";
    }
  }
  return null;
};
