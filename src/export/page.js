import { MAX_DPI, MAX_PIXELS, capture, withTimeout } from "./capture.js";
import { docPath } from "./names.js";

// A document that takes longer than this to capture fails, in milliseconds
export const TIMEOUT = 120_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Waits until the page in render mode says what it is: "ready", or "empty" when
// it has nothing to show for the game (see RenderState). Stops when stopped()
// is true.
const renderState = async (slot, stopped, pollMs) => {
  while (!stopped()) {
    const state = await slot.evaluate(
      "document.body && document.body.dataset.renderState",
    );
    if (state) return state;
    await sleep(pollMs);
  }
};

// The capture of an export over a pool of slots (see createPool). A slot is
//   load(path)            shows the page of the site at path, a promise
//   send, evaluate        the adapter of the shared capture
//   close()
// Returns async (job) => bytes, to run with runExport. A slot that fails or
// takes too long is discarded, so a document can not break the ones after it.
export const createPageCapture = ({
  pool,
  dpi = MAX_DPI,
  maxPixels = MAX_PIXELS,
  timeout = TIMEOUT,
  pollMs = 25,
}) => {
  const run = async (slot, job, stopped) => {
    const path = docPath(job.doc);
    await slot.load(path);
    if ((await renderState(slot, stopped, pollMs)) !== "ready") {
      throw new Error(`${path} has nothing to show for this game`);
    }
    return capture(slot, job, { dpi, maxPixels });
  };

  return async (job) => {
    const slot = await pool.acquire();
    let over = false;
    try {
      const bytes = await withTimeout(
        run(slot, job, () => over),
        timeout,
        `Timed out after ${timeout / 1000} seconds`,
      );
      await pool.release(slot);
      return bytes;
    } catch (error) {
      await pool.release(slot, { discard: true });
      throw error;
    } finally {
      over = true;
    }
  };
};
