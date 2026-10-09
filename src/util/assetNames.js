// Custom images of a game: the rules every surface shares (the renderer, the
// Electron main process and the CLI loader). A plain ES module with no
// imports, DOM, React or Vite alias, so it can be imported as plain Node.
//
// A custom image is used in the game JSON as "custom/<name>": an icon (the
// `icon` of a token, the `type` of an icon or terrain element), a logo (the
// `logo` of a token) or a train image (`train.image`). The images are not part
// of the game JSON. They come from
//   - a folder next to the game file: <game>.assets/icons|logos|trains/<name>.svg|png
//     (see `assetsFolder`), in the CLI and the desktop app,
//   - browser storage (the `game_assets` IndexedDB store), in the web app.
//
// The runtime asset map ("assets") that every surface produces and the
// resolver (src/util/assets.js) reads is plain JSON, keyed by the NAME (the
// part after "custom/", without extension):
//   { icons: { name: svgText }, logos: { name: svgText }, trains: { name: "data:image/png;base64,..." } }
// Read it with Object.hasOwn, never with a bare `assets.icons[name]`.

export const CUSTOM_PREFIX = "custom/";

// The kinds of image, which are also the folder names
export const KINDS = ["icons", "logos", "trains"];

// The file extension of each kind (stored lower case)
export const KIND_EXTENSION = { icons: "svg", logos: "svg", trains: "png" };

export const MAX_NAME_LENGTH = 64;
export const MAX_SVG_BYTES = 512 * 1024;
export const MAX_PNG_BYTES = 2 * 1024 * 1024;
export const MAX_FILES = 200;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
// Width and height of a PNG, from its IHDR
export const MAX_PNG_DIMENSION = 4096;
// Files taken from one drop
export const MAX_DROP_FILES = 20;

// First character alphanumeric, then letters, digits, dot, underscore, dash
export const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const RESERVED = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`),
]);

// Windows cannot create these as a file, with or without an extension
// ("con", "CON.svg", "nul.tar.gz")
export const isReservedName = (name) =>
  RESERVED.has(String(name).split(".")[0].toUpperCase());

// Why a name cannot be used, or null: "empty", "long", "invalid" or "reserved"
export const nameProblem = (name) => {
  if (typeof name !== "string" || name === "") return "empty";
  if (name.length > MAX_NAME_LENGTH) return "long";
  if (!NAME_PATTERN.test(name)) return "invalid";
  if (name.endsWith(".")) return "invalid";
  if (isReservedName(name)) return "reserved";
  return null;
};

export const isValidName = (name) => nameProblem(name) === null;

// Names are the same without regard to case (a case-insensitive file system
// cannot hold both)
export const sameName = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.toLowerCase() === b.toLowerCase();

// The name in `names` that `name` clashes with without regard to case, or
// undefined
export const findDuplicate = (names, name) =>
  names.find((existing) => sameName(existing, name));

// A usable name from the name of a dropped file: the extension is removed,
// characters outside the rule become "-", leading non-alphanumerics are
// dropped, the length is cut to the maximum, and an empty or reserved result
// falls back to "image".
export const sanitizeName = (fileName) => {
  let name = String(fileName ?? "")
    // The folder of a path
    .replace(/^.*[\\/]/, "")
    .replace(/\.[^.]*$/, "")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/^[^A-Za-z0-9]+/, "")
    .slice(0, MAX_NAME_LENGTH)
    .replace(/\.+$/, "");
  if (!name || isReservedName(name)) name = "image";
  return name;
};

// The lower-cased extension of a file name without the dot ("A.SVG" is
// "svg"), or "" for none
export const extensionOf = (fileName) => {
  const match = /\.([^./\\]+)$/.exec(String(fileName ?? ""));
  return match ? match[1].toLowerCase() : "";
};

// The kinds a file extension can be: svg is an icon or a logo, png a train
export const kindsOfExtension = (extension) =>
  extension === "svg"
    ? ["icons", "logos"]
    : extension === "png"
      ? ["trains"]
      : [];

export const isKind = (kind) => KINDS.includes(kind);

export const maxBytes = (kind) =>
  KIND_EXTENSION[kind] === "png" ? MAX_PNG_BYTES : MAX_SVG_BYTES;

// "custom/<name>" for a name
export const customId = (name) => `${CUSTOM_PREFIX}${name}`;

export const isCustomId = (id) =>
  typeof id === "string" && id.startsWith(CUSTOM_PREFIX);

// The name of a custom id, or undefined when it is not one
export const customName = (id) =>
  isCustomId(id) ? id.slice(CUSTOM_PREFIX.length) : undefined;

// The folder of the images of a game file: "/games/x.json" is
// "/games/x.assets". Only the name is changed, so it works for both kinds of
// path separator.
export const assetsFolder = (gamePath) =>
  String(gamePath).replace(/\.json$/i, "") + ".assets";

// A map with no prototype to build up (Object.hasOwn still works on a plain
// object after it went through JSON or IPC)
export const emptyAssets = () => ({
  icons: Object.create(null),
  logos: Object.create(null),
  trains: Object.create(null),
});

// How many files and bytes (SVG text counted in UTF-8, a PNG data URI counted
// as the bytes it holds) an asset map has
const dataUriBytes = (uri) => {
  const base64 = String(uri).slice(String(uri).indexOf(",") + 1);
  const padding = /=*$/.exec(base64)[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
};
const textBytes = (text) => new TextEncoder().encode(text).length;

export const assetBytes = (kind, value) =>
  kind === "trains" ? dataUriBytes(value) : textBytes(value);

export const assetTotals = (assets) => {
  let count = 0;
  let bytes = 0;
  for (const kind of KINDS) {
    const map = assets?.[kind] ?? {};
    for (const name of Object.keys(map)) {
      count += 1;
      bytes += assetBytes(kind, map[name]);
    }
  }
  return { count, bytes };
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Checks the 8 byte signature and the IHDR chunk of a PNG (bytes is a
// Uint8Array or a Node Buffer). Gives { ok: true, width, height } or
// { ok: false, reason } with the reason "signature", "header" or "dimensions".
export const checkPng = (bytes) => {
  if (
    !bytes ||
    bytes.length < 33 ||
    PNG_SIGNATURE.some((byte, i) => bytes[i] !== byte)
  ) {
    return { ok: false, reason: "signature" };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The IHDR chunk follows the signature: length 13, then the type
  if (
    view.getUint32(8) !== 13 ||
    view.getUint32(12) !== 0x49484452 // "IHDR"
  ) {
    return { ok: false, reason: "header" };
  }
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (
    width < 1 ||
    height < 1 ||
    width > MAX_PNG_DIMENSION ||
    height > MAX_PNG_DIMENSION
  ) {
    return { ok: false, reason: "dimensions", width, height };
  }
  return { ok: true, width, height };
};

// Why a file cannot be an image of this kind, or null. `bytes` is a
// Uint8Array / Buffer of the whole file; the name is the name without
// extension. Checks the name, the size and for a PNG the signature and header.
// (SVG content is only checked by the renderer's sanitizer.)
export const assetProblem = (kind, name, bytes) => {
  if (!isKind(kind)) return "kind";
  const named = nameProblem(name);
  if (named) return named;
  if (bytes.length > maxBytes(kind)) return "size";
  if (kind === "trains") {
    const png = checkPng(bytes);
    if (!png.ok) return png.reason;
  }
  return null;
};

// "data:image/png;base64,..." from PNG bytes, without Buffer or btoa so it
// runs in Node and the browser alike
const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
export const pngDataUri = (bytes) => {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += BASE64[a >> 2];
    out += BASE64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? "=" : BASE64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? "=" : BASE64[c & 63];
  }
  return `data:image/png;base64,${out}`;
};

// The bytes of a data URI made by pngDataUri
export const pngBytes = (uri) => {
  const base64 = String(uri).slice(String(uri).indexOf(",") + 1);
  const clean = base64.replace(/=+$/, "");
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n = [0, 1, 2, 3].map((k) => BASE64.indexOf(clean[i + k] ?? "A"));
    out[o++] = (n[0] << 2) | (n[1] >> 4);
    if (o < out.length) out[o++] = ((n[1] & 15) << 4) | (n[2] >> 2);
    if (o < out.length) out[o++] = ((n[2] & 3) << 6) | n[3];
  }
  return out;
};

export const PNG_DATA_URI = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;
