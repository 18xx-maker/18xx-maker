import { randomUUID } from "node:crypto";
import nodeFs from "node:fs";
import path from "node:path";

import { readAsset } from "#export/assets";
import { insideFolder } from "#export/sink";
import {
  KINDS,
  KIND_EXTENSION,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  assetsFolder,
  extensionOf,
  isKind,
  maxBytes,
  pngBytes,
  sameName,
} from "#util/assetNames";

// Adding a custom image to the folder of a game file (<game>.assets/<kind>/,
// see util/assetNames). This is the only place the app writes images; saving a
// game never does. The page sends the bytes of a dropped file, never a path:
// the folder is derived from the config's summary of the game, the name and
// kind are checked by the shared rules, and nothing is written outside the
// folder or through a link.
//
// An error is thrown with the message "asset:<code>" (the preload turns it
// into error.code, an IPC error only keeps the message):
//   game      the game is not known (or is not a file game)
//   kind      not icons, logos or trains
//   name      not usable (empty, long, invalid, reserved)
//   size      over the limit of the kind
//   content   not an image of the kind (PNG signature, header and dimensions;
//             SVG encoding, root and a deny list). The page sanitizes SVG when
//             it draws it; the file keeps the original bytes.
//   exists    that name is taken (without regard to case) and replace is off
//   limit     the game would have more than 200 images or 10 MB of them
//   folder    <game>.assets or its kind folder is a file, a link or leaves the
//             game's folder
//   unsafe    the file to replace is a link, a folder or has other links
//   denied    no permission
//   readonly  the volume is read-only
//   full      no space left
//   failed    anything else
class AssetError extends Error {
  constructor(code, detail, options) {
    super(detail ? `asset:${code} ${detail}` : `asset:${code}`, options);
    this.code = code;
  }
}

const FS_CODES = {
  EACCES: "denied",
  EPERM: "denied",
  EROFS: "readonly",
  ENOSPC: "full",
  EDQUOT: "full",
  ENOTDIR: "folder",
  ELOOP: "folder",
  ENOENT: "folder",
};

const mapError = (e) => {
  if (e instanceof AssetError) return e;
  return new AssetError(FS_CODES[e?.code] ?? "failed", e?.message, {
    cause: e,
  });
};

const NAME_PROBLEMS = ["empty", "long", "invalid", "reserved"];

const lstatOrNull = (fs, file) => {
  try {
    return fs.lstatSync(file);
  } catch (e) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
};

const stemOf = (fileName) => {
  const ext = extensionOf(fileName);
  return ext ? fileName.slice(0, -(ext.length + 1)) : fileName;
};

// A folder that is really one: not a link, a file, or a path that leaves
// where it should be. Creates it when it is not there.
const ensureFolder = (fs, dir, what) => {
  let stat = lstatOrNull(fs, dir);
  if (!stat) {
    try {
      fs.mkdirSync(dir);
    } catch (e) {
      if (e?.code !== "EEXIST") throw e;
    }
    stat = fs.lstatSync(dir);
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new AssetError("folder", `${what} is not a folder`);
  }
};

// The images already in the folders of a game: how many and how many bytes,
// not counting the one file `skip` (a path)
const folderTotals = (fs, root, skip) => {
  let count = 0;
  let bytes = 0;
  for (const kind of KINDS) {
    const dir = path.join(root, kind);
    const stat = lstatOrNull(fs, dir);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || extensionOf(entry.name) !== KIND_EXTENSION[kind])
        continue;
      const file = path.join(dir, entry.name);
      if (file === skip) continue;
      count += 1;
      bytes += fs.lstatSync(file).size;
    }
  }
  return { count, bytes };
};

const LINK_UNSUPPORTED = ["EPERM", "ENOSYS", "ENOTSUP", "EOPNOTSUPP", "EXDEV"];

// Writes one image into <game>.assets/<kind>/<name>.<ext> and gives the asset
// as the asset map keeps it: { kind, name, value, replaced }. `bytes` is a
// Buffer. Synchronous; the caller serializes calls per game (see
// createAddAsset).
export const storeAsset = (
  { gamePath, kind, name, bytes, replace = false },
  fs = nodeFs,
) => {
  if (!isKind(kind)) throw new AssetError("kind");
  const { value, problem } = readAsset(kind, name, bytes);
  if (problem) {
    if (NAME_PROBLEMS.includes(problem)) throw new AssetError("name", problem);
    if (problem === "size") throw new AssetError("size");
    throw new AssetError("content", problem);
  }

  const root = assetsFolder(gamePath);
  const dir = path.join(root, kind);
  const extension = KIND_EXTENSION[kind];

  try {
    ensureFolder(fs, root, root);
    ensureFolder(fs, dir, dir);
    // Neither may reach outside where the game file is, whatever the links
    const realRoot = fs.realpathSync(root);
    if (
      realRoot !==
        path.join(fs.realpathSync(path.dirname(root)), path.basename(root)) ||
      fs.realpathSync(dir) !== path.join(realRoot, kind)
    ) {
      throw new AssetError("folder", "the images are not in the game folder");
    }

    // A name that is taken without regard to case (the file system may not
    // tell them apart), whatever kind of entry it is
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const taken = entries.find(
      (entry) =>
        extensionOf(entry.name) === extension &&
        sameName(stemOf(entry.name), name),
    );
    let target = path.join(dir, `${name}.${extension}`);
    if (taken) {
      target = insideFolder(dir, taken.name);
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink > 1) {
        throw new AssetError("unsafe", taken.name);
      }
      if (!replace) throw new AssetError("exists", taken.name);
    } else {
      target = insideFolder(dir, `${name}.${extension}`);
    }

    const totals = folderTotals(fs, root, taken ? target : undefined);
    if (
      totals.count + 1 > MAX_FILES ||
      totals.bytes + bytes.length > MAX_TOTAL_BYTES
    ) {
      throw new AssetError("limit");
    }

    // Written whole next to the target first, so a reader (the watcher) never
    // sees half a file and a name that is taken is never overwritten
    const temp = path.join(dir, `.${randomUUID()}.tmp`);
    fs.writeFileSync(temp, bytes, { flag: "wx", mode: 0o644 });
    try {
      if (taken) {
        fs.renameSync(temp, target);
      } else {
        try {
          fs.linkSync(temp, target);
        } catch (e) {
          if (e?.code === "EEXIST") throw new AssetError("exists", name);
          if (!LINK_UNSUPPORTED.includes(e?.code)) throw e;
          // No hard links on this volume
          try {
            fs.writeFileSync(target, bytes, { flag: "wx", mode: 0o644 });
          } catch (e2) {
            if (e2?.code === "EEXIST") throw new AssetError("exists", name);
            throw e2;
          }
        }
      }
    } finally {
      try {
        fs.unlinkSync(temp);
      } catch {
        // Renamed away, or never written
      }
    }

    return {
      kind,
      name: taken ? stemOf(taken.name) : name,
      value,
      replaced: !!taken,
    };
  } catch (e) {
    throw mapError(e);
  }
};

// The bytes of an entry of an asset map
const entryBytes = (kind, value) =>
  kind === "trains" ? Buffer.from(pngBytes(value)) : Buffer.from(value, "utf8");

// Writes a whole asset map into the folder of a game file (the images of a
// copy of a game, see saveGameAs). Replaces what is there.
export const writeAssetMap = (gamePath, assets, fs = nodeFs) => {
  for (const kind of KINDS) {
    const map = assets?.[kind] ?? {};
    for (const name of Object.keys(map)) {
      storeAsset(
        {
          gamePath,
          kind,
          name,
          bytes: entryBytes(kind, map[name]),
          replace: true,
        },
        fs,
      );
    }
  }
};

const isPlainObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

// The handler of the addAsset channel (registered with the sender check):
//   addAsset(id, kind, name, bytes, { replace })
// id is the id of an electron game, kind icons, logos or trains, name the name
// without extension, bytes an ArrayBuffer or typed array of the file and
// replace allows an existing image of that name to be replaced. Resolves with
// the stored asset { kind, name, value, replaced } and rejects with
// "asset:<code>" (see above). The calls for a game run one after the other.
export const createAddAsset = ({ summaryOf, fs = nodeFs }) => {
  const queues = new Map();
  const queued = (id, task) => {
    const run = (queues.get(id) ?? Promise.resolve())
      .catch(() => {})
      .then(task);
    queues.set(id, run);
    const clear = () => {
      if (queues.get(id) === run) queues.delete(id);
    };
    run.then(clear, clear);
    return run;
  };

  return async (event, id, kind, name, bytes, options) => {
    if (typeof id !== "string") throw new AssetError("game");
    if (!isKind(kind)) throw new AssetError("kind");
    if (typeof name !== "string") throw new AssetError("name", "invalid");
    if (options !== undefined && !isPlainObject(options)) {
      throw new AssetError("failed", "invalid options");
    }
    if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes)) {
      throw new AssetError("content", "bytes");
    }
    // Before a copy is made of it
    if (bytes.byteLength > maxBytes(kind)) throw new AssetError("size");

    const summary = summaryOf(id);
    if (
      !summary ||
      (summary.type !== undefined && summary.type !== "electron")
    ) {
      throw new AssetError("game");
    }

    const data =
      bytes instanceof ArrayBuffer
        ? Buffer.from(new Uint8Array(bytes))
        : Buffer.from(
            new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength),
          );

    return queued(id, () =>
      storeAsset(
        {
          gamePath: summary.path,
          kind,
          name,
          bytes: data,
          replace: options?.replace === true,
        },
        fs,
      ),
    );
  };
};
