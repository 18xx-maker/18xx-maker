import clsx from "clsx";
import { useEffect } from "react";

import Toolbar from "@/components/Toolbar";
import Config from "@/components/config/Config";

import { useBooleanParam } from "@/util/query";
import { getRenderInput } from "@/util/renderInput";

const Viewport = ({ children }) => {
  const [config] = useBooleanParam("config");
  const [print] = useBooleanParam("print");

  // The scroll past the edge (macOS rubber banding) shows the page canvas,
  // not #viewport, so the editor background and overscroll rule go on <html>
  useEffect(() => {
    if (print) return;
    const classes = ["editor-checkered", "overscroll-none", "print:bg-none"];
    document.documentElement.classList.add(...classes);
    return () => document.documentElement.classList.remove(...classes);
  }, [print]);

  // The editor prints on white, the exports (render mode) keep their own
  // transparent background
  useEffect(() => {
    if (print || getRenderInput()) return;
    document.documentElement.classList.add("editor-print");
    return () => document.documentElement.classList.remove("editor-print");
  }, [print]);

  return (
    <div
      id="viewport"
      className={clsx(
        !print && "editor-checkered min-h-dvh",
        "print:bg-none select-none overscroll-none",
      )}
    >
      {!print && <Toolbar />}
      {config && !print && <Config />}
      <div
        id="viewport-children"
        className={clsx(
          // Plain pages (no pan and zoom editor) start below the fixed toolbar
          // and sit in the middle when narrower than the window, a page wider
          // than the window starts at the left edge and scrolls ("safe")
          !print &&
            !getRenderInput() &&
            "not-has-[#editor]:pt-16 not-has-[#editor]:flex not-has-[#editor]:flex-col not-has-[#editor]:[align-items:safe_center] print:pt-0! print:block!",
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Viewport;
