import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { createAlert, createProgressAlert } from "@/state";
import { exportSvgs, saveFile } from "@/util/webExport";

// As the progress of src/export/service.js
const percent = (done, total) => Math.floor((done / total) * 100);

// The export of the web version: the svgs of a request (the output of
// planExport) are captured in the page, the progress and the result are
// alerts and the file is downloaded.
const useWebExport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const controller = useRef(null);
  const [running, setRunning] = useState(false);

  const alert = (title, message, type) =>
    dispatch(createAlert(title, message, type));

  const run = async (request) => {
    // One export at a time
    if (controller.current) return;

    const abort = new AbortController();
    controller.current = abort;
    setRunning(true);
    try {
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
      controller.current = null;
      setRunning(false);
    }
  };

  const cancel = () => controller.current?.abort();

  return { run, cancel, running };
};

export default useWebExport;
