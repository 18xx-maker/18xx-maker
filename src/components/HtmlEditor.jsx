import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useEditing } from "@/components/Editor";

import { TOOLBAR_INSET, usePanZoom } from "@/hooks/use-pan-zoom";

const MIN_SCALE = 0.02;
const MAX_SCALE = 20;

// The width that wraps floated content (the pages of cards and charters) into
// a block close to the shape of the window instead of one long line. The
// content is first measured on one line, then wrapped into narrower and
// narrower widths until it no longer fits or is taller than the window shape.
const wrapWidth = (container, content) => {
  const vw = container.clientWidth || window.innerWidth;
  const vh = container.clientHeight || window.innerHeight;
  content.style.width = "max-content";
  const full = content.offsetWidth;
  const target = vw / vh;
  let best = full;
  let bestDiff = Math.abs(
    Math.log(full / (content.offsetHeight || 1) / target),
  );
  for (let n = 2; n <= 16; n++) {
    const width = Math.ceil(full / n);
    content.style.width = `${width}px`;
    // Narrower than the widest item, it can't wrap any further
    if (content.scrollWidth > width) break;
    const diff = Math.abs(Math.log(width / content.offsetHeight / target));
    if (diff < bestDiff) {
      best = width;
      bestDiff = diff;
    }
  }
  content.style.width = "";
  return best;
};

// The space kept free around what the view starts on, as a fraction of it
const PADDING = 0.06;

// The view that fits the first `count` pages (the whole content when there is
// no page) in the window below the toolbar with some padding, centered
const fit = (container, content, page, count) => {
  const found = page ? [...content.querySelectorAll(page)].slice(0, count) : [];
  const origin = content.getBoundingClientRect();
  // Where the pages are inside the content, in unscaled pixels
  const shown = origin.width / (content.offsetWidth || 1);
  let left = 0;
  let top = 0;
  let w = content.offsetWidth || 1;
  let h = content.offsetHeight || 1;
  if (found.length > 0 && shown) {
    const boxes = found.map((el) => el.getBoundingClientRect());
    const l = Math.min(...boxes.map((b) => b.left));
    const t = Math.min(...boxes.map((b) => b.top));
    left = (l - origin.left) / shown;
    top = (t - origin.top) / shown;
    w = (Math.max(...boxes.map((b) => b.right)) - l) / shown || 1;
    h = (Math.max(...boxes.map((b) => b.bottom)) - t) / shown || 1;
  }
  const vw = container.clientWidth || window.innerWidth;
  const vh = container.clientHeight || window.innerHeight;
  const inset = Math.min(TOOLBAR_INSET, vh / 4);
  const avail = vh - inset;
  const scale = Math.min(
    vw / (w * (1 + 2 * PADDING)),
    avail / (h * (1 + 2 * PADDING)),
    1,
  );
  return {
    x: (vw - w * scale) / 2 - left * scale,
    y: inset + (avail - h * scale) / 2 - top * scale,
    scale,
  };
};

const PanZoom = ({ page, count, children }) => {
  const container = useRef(null);
  const content = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [width, setWidth] = useState("max-content");

  const reset = useCallback(
    () => setView(fit(container.current, content.current, page, count)),
    [page, count],
  );

  // Start with the whole content in view, wrapped to fit the window
  useLayoutEffect(() => {
    const w = wrapWidth(container.current, content.current);
    setWidth(`${w}px`);
    content.current.style.width = `${w}px`;
    reset();
  }, [reset]);

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
          width,
          display: "flow-root",
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
// ?print=true and render mode (the exports) get the children untouched. The
// view starts on the first `count` elements matching the `page` selector.
const HtmlEditor = ({ page, count = 1, children }) => {
  if (!useEditing()) return children;
  return (
    <PanZoom page={page} count={count}>
      {children}
    </PanZoom>
  );
};

export default HtmlEditor;
