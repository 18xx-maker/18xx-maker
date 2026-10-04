import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useEditing } from "@/components/Editor";

import { usePanZoom } from "@/hooks/use-pan-zoom";

const MIN_SCALE = 0.02;
const MAX_SCALE = 20;

// The view that fits the content in the window, centered
const fit = (container, content) => {
  const w = content.offsetWidth || 1;
  const h = content.offsetHeight || 1;
  const vw = container.clientWidth || window.innerWidth;
  const vh = container.clientHeight || window.innerHeight;
  const scale = Math.min(vw / w, vh / h, 1);
  return { x: (vw - w * scale) / 2, y: (vh - h * scale) / 2, scale };
};

const PanZoom = ({ children }) => {
  const container = useRef(null);
  const content = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });

  const reset = useCallback(
    () => setView(fit(container.current, content.current)),
    [],
  );

  // Start with the whole content in view
  useLayoutEffect(reset, [reset]);

  usePanZoom(container, {
    onPan: (dx, dy) => setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy })),
    // Zoom around the center of the view
    onZoom: (mult) =>
      setView((v) => {
        const scale = Math.min(Math.max(v.scale / mult, MIN_SCALE), MAX_SCALE);
        const cx = container.current.clientWidth / 2;
        const cy = container.current.clientHeight / 2;
        const ratio = scale / v.scale;
        return {
          x: cx - (cx - v.x) * ratio,
          y: cy - (cy - v.y) * ratio,
          scale,
        };
      }),
    onReset: reset,
  });

  return (
    <div
      id="editor"
      ref={container}
      className="overflow-hidden w-screen h-screen touch-none"
    >
      <div
        ref={content}
        style={{
          width: "max-content",
          transformOrigin: "0 0",
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Pan and zoom for html content, the counterpart of SvgEditor. Printing,
// ?print=true and render mode (the exports) get the children untouched.
const HtmlEditor = ({ children }) => {
  if (!useEditing()) return children;
  return <PanZoom>{children}</PanZoom>;
};

export default HtmlEditor;
