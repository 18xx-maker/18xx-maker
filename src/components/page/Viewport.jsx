import clsx from "clsx";
import { useEffect } from "react";

import Toolbar from "@/components/Toolbar";
import Config from "@/components/config/Config";

import { useBooleanParam } from "@/util/query";

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

  return (
    <div
      id="viewport"
      className={clsx(
        !print && "editor-checkered min-h-screen",
        "print:bg-none select-none overscroll-none",
      )}
    >
      {!print && <Toolbar />}
      {config && !print && <Config />}
      <div id="viewport-children">{children}</div>
    </div>
  );
};

export default Viewport;
