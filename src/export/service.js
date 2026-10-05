import { MAX_DPI } from "./capture.js";
import { BACKGROUNDS } from "./options.js";
import { createPageCapture } from "./page.js";
import { runExport } from "./run.js";
import { gameFolder } from "./sink.js";

// The export of the app, as the main process runs it. Everything that touches
// Electron is passed in, so this does not know about windows, dialogs or file
// systems:
//
// dialogs     { saveFile({ title, name, format }) -> { out, name } | undefined,
//                chooseFolder(title) -> folder | undefined }
// openPool    ({ id, game, config }) -> a pool of capture slots (see
//             createPool) of a game in render mode. Closing it closes them.
// createSink  (out) -> { write(relPath, bytes) }
// zip         async (out, names) writes the Board 18 zip
// show        (out, relPath) shows a file in its folder
// concurrency how many files are captured at the same time
// pageOptions dpi limits and timeouts for createPageCapture
//
// A request is what the renderer plans (see util/exportPlan):
//   { id, game, config, jobs, dpi, background?, single?, out?, b18?: { names, json } }
// where jobs is [{ doc, format, path }] (see exportJobs), config is the layers
// below the game's own, and out is a folder chosen before (otherwise a dialog
// asks, for a file when single).
//
// run(owner, request, ui) resolves with { done, total, failed, cancelled, out }
// ui is { progress(title, message, percent), alert(title, message, type) }.
// An owner (a window) has one export at a time.

const FORMATS = ["pdf", "png", "svg", "b18"];

const SAVE_TITLES = { pdf: "Save PDF", svg: "Save SVG" };

// A name in the output folder: relative, and not going up from it
const plainName = (name) =>
  typeof name === "string" &&
  name !== "" &&
  !name.includes("\0") &&
  !/^([\\/]|[a-zA-Z]:)/.test(name) &&
  !name.split(/[\\/]/).includes("..");

const invalid = (message) => new Error(`Invalid export: ${message}`);

export const validateRequest = (request) => {
  if (!request || typeof request !== "object") throw invalid("no request");
  const { game, jobs, dpi = MAX_DPI, background, single, b18 } = request;
  if (!game || typeof game !== "object") throw invalid("no game");
  if (typeof request.id !== "string" || request.id === "") {
    throw invalid("no game id");
  }
  if (!Array.isArray(jobs) || jobs.length === 0) throw invalid("no files");
  if (single && jobs.length !== 1) throw invalid("one file expected");
  if (!(dpi >= 1 && dpi <= MAX_DPI)) {
    throw invalid(`the resolution must be 1 to ${MAX_DPI} dpi`);
  }
  if (background !== undefined && !BACKGROUNDS.includes(background)) {
    throw invalid("the background must be transparent or white");
  }
  for (const job of jobs) {
    if (
      !FORMATS.includes(job.format) ||
      typeof job.path !== "string" ||
      typeof job.doc?.route !== "string" ||
      !job.doc.route.startsWith("/games/")
    ) {
      throw invalid("a file is not valid");
    }
  }
  if (b18) {
    const { names, json } = b18;
    if (
      !json ||
      typeof json !== "object" ||
      Array.isArray(json) ||
      !plainName(names?.zip) ||
      !plainName(names?.folder) ||
      !plainName(names?.json)
    ) {
      throw invalid("no Board 18 box");
    }
  }
};

const percent = (done, total) => Math.floor((done / total) * 100);

export const createExportService = ({
  dialogs,
  openPool,
  createSink,
  zip,
  show,
  concurrency = 1,
  pageOptions = {},
}) => {
  const active = new Map();

  // Where the files go, and the jobs with their path there. A single file is
  // saved under the name the user chose, the other files go in the folder of
  // the game in the chosen folder, like the CLI.
  const destination = async (request) => {
    const { jobs, single, out } = request;
    if (single) {
      const [job] = jobs;
      if (out) return { out, jobs };
      const file = await dialogs.saveFile({
        title: SAVE_TITLES[job.format] || "Save Screenshot",
        name: job.path,
        format: job.format,
      });
      return file && { out: file.out, jobs: [{ ...job, path: file.name }] };
    }

    const folder = out || (await dialogs.chooseFolder("Select directory"));
    return folder && { out: gameFolder(folder, request.id), jobs };
  };

  const run = async (owner, request, ui) => {
    validateRequest(request);
    if (active.has(owner)) throw new Error("An export is already running");

    const controller = new AbortController();
    const { signal } = controller;
    active.set(owner, controller);

    try {
      const where = await destination(request);
      const { dpi = MAX_DPI, background, b18 } = request;
      if (!where || signal.aborted) {
        return { done: 0, total: 0, failed: [], cancelled: true };
      }

      const { out, jobs } = where;
      const sink = createSink(out);
      const written = [];
      const write = (relPath, bytes) => {
        sink.write(relPath, bytes);
        written.push(relPath);
      };
      const failed = [];

      const pool = openPool({
        id: request.id,
        game: request.game,
        config: request.config,
      });
      // Closing the pool closes the windows, and a capture in progress ends
      // at once without waiting for what a closed window would answer
      const stopped = new Promise((_, reject) =>
        signal.addEventListener(
          "abort",
          () => {
            pool.close();
            reject(new Error("Export cancelled"));
          },
          { once: true },
        ),
      );
      stopped.catch(() => {});
      const page = createPageCapture({
        pool,
        dpi,
        background,
        ...pageOptions,
      });

      let result;
      try {
        if (b18) write(b18.names.json, JSON.stringify(b18.json, null, 2));

        result = await runExport({
          jobs,
          capture: (job) => Promise.race([page(job), stopped]),
          sink: { write },
          concurrency,
          signal,
          onProgress: ({ type, done, total, name, error }) => {
            if (type === "doc") {
              ui.progress(
                "Game Exporting",
                `${done}/${total} - ${name}`,
                percent(done, total),
              );
            } else if (type === "fail" && !signal.aborted) {
              failed.push({ path: name, message: error.message });
            }
          },
        });

        if (b18 && !result.cancelled) {
          await zip(out, b18.names);
          written.push(b18.names.zip);
        }
      } finally {
        await pool.close();
      }

      const { done, total, cancelled } = result;
      if (cancelled) {
        ui.alert(
          "Export Cancelled",
          `Exported ${done} of ${total} files to ${out}`,
          "warning",
        );
      } else if (failed.length > 0) {
        ui.alert(
          "Export Failed",
          `${failed.length} of ${total} files failed, ${failed[0].path}: ${failed[0].message}`,
          "error",
        );
      } else {
        ui.alert(
          "Game Exported",
          `Exported ${done} files to ${out}`,
          "success",
        );
      }
      if (written.length > 0 && !cancelled) show(out, written.at(-1));

      return { done, total, failed, cancelled, out };
    } finally {
      active.delete(owner);
    }
  };

  return {
    run,
    // Stops the export of an owner, no new file is started and the windows close
    cancel: (owner) => active.get(owner)?.abort(),
    cancelAll: () => active.forEach((controller) => controller.abort()),
    isRunning: (owner) => active.has(owner),
  };
};
