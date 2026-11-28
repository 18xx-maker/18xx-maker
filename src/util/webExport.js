import { createPageCapture } from "@/export/page.js";
import { createPool } from "@/export/pool.js";
import { runExport } from "@/export/run.js";
import { zipFiles } from "@/export/zipFiles.js";
import { titleToFilename } from "@/util";

// Exports of the web version: every document is shown in a hidden iframe of the
// page (same origin, in render mode through iframe.__RENDER_INPUT__) and
// captured with the shared export core. Only svg is exported here, the iframe
// has no devtools protocol.

// The adapter of an iframe: only the print media emulation of a svg capture
// exists, and it needs nothing because the svg is read from the page itself
export const frameSend = async (method) => {
  if (method !== "Emulation.setEmulatedMedia") {
    throw new Error(`Unsupported on the web: ${method}`);
  }
};

// A capture slot (see createPool) of a hidden iframe showing a document in
// render mode with the input of the game
export const frameSlot = async (input) => {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position: fixed; left: -100000px; width: 1600px; height: 1200px; border: 0";
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.__RENDER_INPUT__ = input;
  document.body.appendChild(iframe);

  return {
    load: (path) =>
      new Promise((resolve, reject) => {
        iframe.addEventListener("load", () => resolve(), { once: true });
        iframe.addEventListener(
          "error",
          () => reject(new Error(`${path} did not load`)),
          { once: true },
        );
        iframe.src = path;
      }),
    evaluate: async (expression) => iframe.contentWindow.eval(expression),
    send: frameSend,
    close: async () => iframe.remove(),
  };
};

const basename = (path) => path.slice(path.lastIndexOf("/") + 1);

// Exports the svgs of a request (the output of planExport) and returns the
// file to download (see saveFile), null when cancelled or nothing was written
export const exportSvgs = async (
  request,
  {
    signal,
    onProgress = () => {},
    concurrency = 2,
    openSlot = frameSlot,
    timeout,
  } = {},
) => {
  const { id, game, config, assets, jobs } = request;
  const pool = createPool({
    open: () => openSlot({ id, game, config, assets }),
    size: concurrency,
  });
  // Closing the pool removes the iframes, and a capture in progress ends at
  // once without waiting for what a removed iframe would answer
  const stopped = new Promise((_, reject) => {
    const abort = () => {
      pool.close();
      reject(new Error("Export cancelled"));
    };
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
  stopped.catch(() => {});
  const page = createPageCapture({
    pool,
    ...(timeout === undefined ? {} : { timeout }),
  });

  const files = [];
  const failed = [];
  let result;
  try {
    result = await runExport({
      jobs,
      capture: (job) => Promise.race([page(job), stopped]),
      sink: { write: (path, bytes) => files.push({ path, bytes }) },
      concurrency,
      signal,
      onProgress: (event) => {
        if (event.type === "fail" && !signal?.aborted) {
          failed.push({ path: event.name, message: event.error.message });
        }
        onProgress(event);
      },
    });
  } finally {
    await pool.close();
  }

  const { done, total, cancelled } = result;
  const order = new Map(jobs.map((job, i) => [job.path, i]));
  files.sort((a, b) => order.get(a.path) - order.get(b.path));

  let file = null;
  if (!cancelled && files.length === 1) {
    file = {
      name: basename(files[0].path),
      bytes: files[0].bytes,
      type: "image/svg+xml",
    };
  } else if (!cancelled && files.length > 1) {
    file = {
      name: `${titleToFilename(game.info.title)}.zip`,
      bytes: zipFiles(files),
      type: "application/zip",
    };
  }
  return { done, total, failed, cancelled, file };
};

// Downloads a file of the page
export const saveFile = ({ name, bytes, type }) => {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
