import clsx from "clsx";
import { Suspense, lazy, useEffect } from "react";

import Toolbar from "@/components/Toolbar";
import Config from "@/components/config/Config";
import RenderBoundary from "@/components/page/RenderBoundary";

import { useConfig, useGame } from "@/hooks";
import { useEditPanel } from "@/hooks/useEditPanel";
import { useLocation, useMatch } from "@/router";
import { parsePrintScale } from "@/util";
import { useBooleanParam } from "@/util/query";
import { getRenderInput } from "@/util/renderInput";

// The form loads when the panel is first opened
const EditPanel = lazy(() => import("@/components/editPanel/EditPanel"));

const Viewport = ({ children }) => {
  const [config] = useBooleanParam("config");
  const [print] = useBooleanParam("print");
  const { open: edit } = useEditPanel();
  const { config: printConfig } = useConfig();
  const game = useGame();
  const { pathname } = useLocation();
  const b18 = useMatch("/games/:slug/b18/*");

  // The print scale zooms the print pages. The Board18 pages have a fixed page
  // size and the exports (render mode) a fixed size, they are never scaled.
  const printScale =
    b18 || getRenderInput() ? 100 : parsePrintScale(printConfig.printScale);
  const scaled = printScale !== 100;

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
      {config && !print && !edit && <Config />}
      {edit && (
        <Suspense fallback={null}>
          <EditPanel />
        </Suspense>
      )}
      <div
        id="viewport-children"
        {...(scaled && {
          "data-print-scale": "",
          style: { "--print-scale": printScale / 100 },
        })}
        className={clsx(
          // Plain pages (no pan and zoom editor) start below the fixed toolbar
          // and sit in the middle when narrower than the window, a page wider
          // than the window starts at the left edge and scrolls ("safe")
          !print &&
            !getRenderInput() &&
            "not-has-[#editor]:pt-16 not-has-[#editor]:flex not-has-[#editor]:flex-col not-has-[#editor]:[align-items:safe_center] print:pt-0! print:block!",
        )}
      >
        <RenderBoundary
          active={edit}
          game={game}
          config={printConfig}
          pathname={pathname}
        >
          {children}
        </RenderBoundary>
      </div>
    </div>
  );
};

export default Viewport;
