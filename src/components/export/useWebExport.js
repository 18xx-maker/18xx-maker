import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { createAlert, createProgressAlert } from "@/state";

// As the progress of src/export/service.js
const percent = (done, total) => Math.floor((done / total) * 100);

// One export at a time for the whole page: the menu (ExportHost) and the
// options (ExportOptions) share the export that runs and its cancel
let controller = null;
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const isRunning = () => controller !== null;
const setController = (next) => {
  controller = next;
  listeners.forEach((listener) => listener());
};

// The export of the web version: the svgs of a request (the output of
// planExport) are captured in the page, the progress and the result are
// alerts and the file is downloaded.
const useWebExport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const running = useSyncExternalStore(subscribe, isRunning);

  const alert = (title, message, type) =>
    dispatch(createAlert(title, message, type));

  const run = async (request) => {
    if (controller) return;

    const abort = new AbortController();
    setController(abort);
    try {
      // Loaded when used, it is not needed by the page itself
      const { exportSvgs, saveFile } = await import("@/util/webExport");
      const result = await exportSvgs(request, {
        signal: abort.signal,
        onProgress: ({ type, done, total, name }) => {
          if (type === "doc") {
            dispatch(
              createProgressAlert(
                t("export.progressTitle"),
                t("export.progress", { done, total, name }),
                percent(done, total),
              ),
            );
          }
        },
      });
      const { done, total, failed, cancelled, file } = result;

      if (total === 0) {
        alert(t("export.failed"), t("export.noFiles"), "error");
      } else if (cancelled) {
        alert(
          t("export.cancelledTitle"),
          t("export.cancelled", { done, total }),
          "warning",
        );
      } else if (failed.length > 0) {
        alert(
          t("export.failed"),
          t("export.someFailed", {
            failed: failed.length,
            total,
            path: failed[0].path,
            message: failed[0].message,
          }),
          "error",
        );
      } else {
        alert(
          t("export.doneTitle"),
          t("export.done", { count: done }),
          "success",
        );
      }

      if (file) saveFile(file);
      return result;
    } catch (error) {
      alert(t("export.failed"), error.message, "error");
    } finally {
      setController(null);
    }
  };

  const cancel = () => controller?.abort();

  return { run, cancel, running };
};

export default useWebExport;
