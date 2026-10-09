// Images dropped onto the app, added to the game on screen as custom images.
//
// The pieces: `captureFiles` reads the files of a drop (synchronously, the
// items are gone after the handler returns), `isGameDrop` decides whether the
// drop is a game or config file (one .json file) or images, and
// `addDroppedImages` checks every file, asks what an SVG is, stores the images
// one at a time and gives back ONE alert for the whole drop (the app has a
// single alert slot).
import { addGameAsset, loadAssets } from "@/state";
import {
  assetProblem,
  customId,
  extensionOf,
  findDuplicate,
  maxBytes,
  nameProblem,
  pngDataUri,
  sanitizeName,
} from "@/util/assetNames";
import { sanitizeSvg } from "@/util/svgSanitize";

// The codes that have a text in assets.errors
const CODES = [
  "kind",
  "empty",
  "long",
  "invalid",
  "reserved",
  "size",
  "png",
  "signature",
  "header",
  "dimensions",
  "svg",
  "type",
  "exists",
  "missing",
  "count",
  "total",
  "quota",
  "notfound",
  "readonly",
  "directory",
  "json",
];
const CODE_WORD = new RegExp(`\\b(${CODES.join("|")})\\b`);

// The codes of the main process (electron/main/addAsset.js) that have another
// name in assets.errors
const MAIN_CODES = {
  game: "notfound",
  name: "invalid",
  content: "svg",
  limit: "count",
  folder: "readonly",
  unsafe: "readonly",
  denied: "readonly",
  full: "quota",
  failed: "unreadable",
};

// The code of a failed write: the `code` of a web error, "asset:<code>" in the
// message of an error from the main process (custom properties of an error do
// not always cross the context bridge), or a known word in the message
export const errorCode = (e) => {
  const message = String(e?.message ?? e ?? "");
  const raw =
    (typeof e?.code === "string" ? e.code : undefined) ??
    /asset:([a-z]+)/.exec(message)?.[1] ??
    CODE_WORD.exec(message)?.[1];
  const code = MAIN_CODES[raw] ?? raw;
  return CODES.includes(code) ? code : "unreadable";
};

// The files of a drop, as { file, directory }. A file that cannot be read from
// the item is left out.
export const captureFiles = (dataTransfer) => {
  const found = [];
  const items = Array.from(dataTransfer?.items ?? []);
  if (items.length) {
    for (const item of items) {
      if (item.kind !== "file") continue;
      let file;
      let directory = false;
      try {
        file = item.getAsFile();
      } catch {
        // No file behind the item
      }
      try {
        directory = !!item.webkitGetAsEntry?.()?.isDirectory;
      } catch {
        // No entry
      }
      found.push({ file: file ?? undefined, directory });
    }
    return found;
  }
  return Array.from(dataTransfer?.files ?? []).map((file) => ({
    file,
    directory: false,
  }));
};

// One .json file (or no file to look at) is a game or a config; anything else
// is images
export const isGameDrop = (files) =>
  files.length === 0 ||
  (files.length === 1 &&
    !files[0].directory &&
    (!files[0].file || extensionOf(files[0].file.name) === "json"));

// The first name of the form name, name-2, name-3 ... that is free (case aside)
export const freeName = (names, name) => {
  let candidate = name;
  for (let n = 2; findDuplicate(names, candidate); n += 1) {
    candidate = `${name.slice(0, 60)}-${n}`;
  }
  return candidate;
};

// A failed answer of the main process: a result with an error or code string
const checkResult = (result) => {
  const code =
    typeof result?.error === "string"
      ? result.error
      : typeof result?.code === "string"
        ? result.code
        : null;
  if (code) throw Object.assign(new Error(code), { code: errorCode({ code }) });
  return result;
};

// Writes an image to where the game keeps them: the folder next to the file
// in the app, IndexedDB in the web app. `bytes` are the bytes of the file.
export const makeStore = (meta, dispatch) => async (item) => {
  const { kind, name, bytes, text, replace } = item;
  if (meta.type === "electron") {
    try {
      checkResult(
        await window.api.addAsset(meta.id, kind, name, bytes, {
          replace: !!replace,
        }),
      );
    } catch (e) {
      throw Object.assign(new Error(errorCode(e)), { code: errorCode(e) });
    }
    // The main process wrote the file; read the folder again
    await dispatch(loadAssets(meta));
    return;
  }
  await dispatch(
    addGameAsset(
      meta.slug,
      kind,
      name,
      kind === "trains" ? pngDataUri(bytes) : text,
      { replace: !!replace },
    ),
  );
};

// Checks, asks about and stores the files of a drop.
//   files    captureFiles(...)
//   assets   the images the game has (state) - for the names that are taken
//   ask      async ({ file, name, svg, taken, index, total, conflict })
//            gives { kind, name, replace } for an SVG, null to skip this
//            file or "cancel" to stop
//   store    async ({ kind, name, bytes, text, replace }), throws an error
//            with a code
//   t        translation function
// Gives { title, message, type } for the alert, or null when nothing was
// done (everything cancelled).
export const addDroppedImages = async ({
  files,
  assets,
  ask,
  store,
  t,
  max,
}) => {
  const taken = {
    icons: Object.keys(assets?.icons ?? {}),
    logos: Object.keys(assets?.logos ?? {}),
    trains: Object.keys(assets?.trains ?? {}),
  };
  const added = [];
  // The names the SVGs of this drop got
  const batch = [];
  const failed = [];
  const reason = (code) => t(`assets.errors.${code}`);
  const fail = (label, code) => failed.push(`${label}: ${reason(code)}`);

  const used = files.slice(0, max);
  if (files.length > used.length) {
    failed.push(
      t("assets.tooMany", { max, count: files.length - used.length }),
    );
  }

  // Which of the files are SVGs to ask about, for "2 of 3"
  const total = used.filter(
    ({ file, directory }) =>
      !directory && file && extensionOf(file.name) === "svg",
  ).length;
  let index = 0;
  let cancelled = false;

  for (const { file, directory } of used) {
    if (cancelled) break;
    const label = file?.name ?? "?";
    if (directory || !file) {
      fail(label, "directory");
      continue;
    }
    const extension = extensionOf(file.name);
    if (extension === "json") {
      fail(label, "json");
      continue;
    }
    if (extension !== "svg" && extension !== "png") {
      fail(label, "type");
      continue;
    }
    const isPng = extension === "png";
    // Before reading anything
    if (file.size > maxBytes(isPng ? "trains" : "icons")) {
      fail(label, "size");
      continue;
    }

    let bytes;
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
    } catch {
      fail(label, "unreadable");
      continue;
    }

    try {
      if (isPng) {
        let name = freeName(taken.trains, sanitizeName(file.name));
        const problem = assetProblem("trains", name, bytes);
        if (problem) {
          fail(label, problem);
          continue;
        }
        // A name taken after we looked (a race) gets the next free one
        for (let attempt = 0; ; attempt += 1) {
          try {
            await store({ kind: "trains", name, bytes });
            break;
          } catch (e) {
            if (errorCode(e) !== "exists" || attempt >= 3) throw e;
            taken.trains.push(name);
            name = freeName(taken.trains, sanitizeName(file.name));
          }
        }
        taken.trains.push(name);
        added.push(t("assets.addedAs.trains", { id: customId(name) }));
        continue;
      }

      let text;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        fail(label, "svg");
        continue;
      }
      if (!sanitizeSvg(text)) {
        fail(label, "svg");
        continue;
      }

      index += 1;
      // A name another SVG of this drop was given is not offered again
      let request = {
        file: label,
        svg: text,
        name: freeName(batch, sanitizeName(file.name)),
        taken: { icons: [...taken.icons], logos: [...taken.logos] },
        index,
        total,
        conflict: false,
      };
      for (let attempt = 0; ; attempt += 1) {
        const answer = await ask(request);
        if (answer === "cancel") {
          cancelled = true;
          break;
        }
        if (!answer) break;
        const problem = nameProblem(answer.name);
        if (problem) {
          fail(label, problem);
          break;
        }
        try {
          await store({
            kind: answer.kind,
            name: answer.name,
            bytes,
            text,
            replace: !!answer.replace,
          });
          if (!findDuplicate(taken[answer.kind], answer.name)) {
            taken[answer.kind].push(answer.name);
          }
          batch.push(answer.name);
          added.push(
            t(`assets.addedAs.${answer.kind}`, { id: customId(answer.name) }),
          );
          break;
        } catch (e) {
          // The name was taken in the meantime: ask again with the clash shown
          if (errorCode(e) !== "exists" || attempt >= 3) throw e;
          taken[answer.kind].push(answer.name);
          request = {
            ...request,
            name: answer.name,
            taken: { icons: [...taken.icons], logos: [...taken.logos] },
            kind: answer.kind,
            conflict: true,
          };
        }
      }
    } catch (e) {
      fail(label, errorCode(e));
    }
  }

  if (!added.length && !failed.length) return null;
  const message = [...added, ...failed].join("\n");
  if (!failed.length)
    return { title: t("assets.added"), message, type: "success" };
  if (!added.length)
    return { title: t("assets.notAdded"), message, type: "error" };
  return { title: t("assets.addedSome"), message, type: "warning" };
};
