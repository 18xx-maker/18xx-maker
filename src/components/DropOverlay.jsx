import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FileUp } from "lucide-react";

const hasFiles = (event) =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

// A dashed border around the window while files are dragged over it, so it is
// clear that they can be dropped. Dragging text shows nothing. `disabled`
// hides it (a dialog is open, render and print modes), `onChange` hears when
// it shows or hides.
const DropOverlay = ({ disabled = false, onChange }) => {
  const { t } = useTranslation();
  const [over, setOver] = useState(false);

  // Tells whether it shows
  useEffect(() => {
    onChange?.(over && !disabled);
  }, [over, disabled, onChange]);

  useEffect(() => {
    if (disabled) {
      setOver(false);
      return;
    }

    // dragenter and dragleave fire for every element on the way
    let depth = 0;
    const reset = () => {
      depth = 0;
      setOver(false);
    };
    const enter = (event) => {
      if (!hasFiles(event) || document.querySelector('[role="dialog"]')) return;
      depth += 1;
      setOver(true);
    };
    const leave = (event) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setOver(false);
    };

    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", reset);
    window.addEventListener("dragend", reset);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", reset);
      window.removeEventListener("dragend", reset);
      window.removeEventListener("blur", reset);
    };
  }, [disabled]);

  if (!over || disabled) return null;

  return (
    <div
      data-testid="drop-overlay"
      className="print:hidden pointer-events-none fixed inset-0 z-40 m-2 flex items-center justify-center rounded-xl border-4 border-dashed border-primary bg-background/60"
    >
      <p className="flex flex-row items-center gap-2 rounded-md bg-background px-4 py-2 text-lg font-medium shadow">
        <FileUp className="size-6" />
        {t("drop.hint")}
      </p>
    </div>
  );
};

export default DropOverlay;
