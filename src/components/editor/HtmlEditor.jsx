import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useEditing } from "@/components/editor/Editor";

import TapContext from "@/context/TapContext";
import { TOOLBAR_INSET, usePanZoom } from "@/hooks/usePanZoom";

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
  // Whether the view was moved since it was fitted, a late layout change
  // (fonts, a resize) refits an untouched view only
  const touched = useRef(false);
  // What the content does with a tap (TilesOverlay)
  const tap = useRef(null);

  const current = useRef(view);
  current.current = view;

  const reset = useCallback(
    () => setView(fit(container.current, content.current, page, count)),
    [page, count],
  );

  const layout = useCallback(() => {
    const w = wrapWidth(container.current, content.current);
    setWidth(`${w}px`);
    content.current.style.width = `${w}px`;
    reset();
  }, [reset]);

  // Start with the whole content in view, wrapped to fit the window
  useLayoutEffect(layout, [layout]);

  // The content changes size once fonts load, and the window when the phone
  // turns or its toolbars move. Only a view that changes is set, the observer
  // also reports the first measure.
  useEffect(() => {
    let live = true;
    const refit = () => {
      if (!live || touched.current) return;
      const before = content.current.style.width;
      const w = `${wrapWidth(container.current, content.current)}px`;
      const wrapped = w !== before;
      content.current.style.width = w;
      const next = fit(container.current, content.current, page, count);
      const last = current.current;
      if (wrapped) setWidth(w);
      if (
        Math.abs(next.x - last.x) > 0.01 ||
        Math.abs(next.y - last.y) > 0.01 ||
        Math.abs(next.scale - last.scale) > 1e-6
      ) {
        setView(next);
      }
    };
    document.fonts?.ready.then(refit);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refit);
    observer?.observe(container.current);
    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [page, count]);

  // An element asks to be panned into view with a "reveal" event (a tile that
  // was just added, possibly on a page far from the view). Centered when it is
  // not wholly in the window below the toolbar and left of the edit panel, the zoom stays.
  useEffect(() => {
    const el = container.current;
    const onReveal = (event) => {
      const box = event.target.getBoundingClientRect();
      const area = el.getBoundingClientRect();
      const top = area.top + Math.min(TOOLBAR_INSET, area.height / 4);
      // The edit panel covers the right side, the view ends where it starts
      // (below md it covers everything, then there is no side to keep clear)
      let right = area.right;
      const panel = document
        .querySelector("[data-edit-panel]")
        ?.getBoundingClientRect();
      if (panel && panel.width > 0 && panel.left > area.left) {
        right = Math.min(right, panel.left);
      }
      if (
        box.left >= area.left &&
        box.right <= right &&
        box.top >= top &&
        box.bottom <= area.bottom
      ) {
        return;
      }
      touched.current = true;
      const dx = (area.left + right) / 2 - (box.left + box.right) / 2;
      const dy = (top + area.bottom) / 2 - (box.top + box.bottom) / 2;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    el.addEventListener("reveal", onReveal);
    return () => el.removeEventListener("reveal", onReveal);
  }, []);

  usePanZoom(container, {
    onTap: (target, event) => tap.current?.(target, event),
    onPan: (dx, dy) => {
      touched.current = true;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    },
    // Zoom around the center of the view, or the point of a pinch
    onZoom: (mult, focus) => {
      touched.current = true;
      setView((v) => {
        const scale = Math.min(Math.max(v.scale / mult, MIN_SCALE), MAX_SCALE);
        const cx = focus ? focus.x : container.current.clientWidth / 2;
        const cy = focus ? focus.y : container.current.clientHeight / 2;
        const ratio = scale / v.scale;
        return {
          x: cx - (cx - v.x) * ratio,
          y: cy - (cy - v.y) * ratio,
          scale,
        };
      });
    },
    onReset: () => {
      touched.current = false;
      reset();
    },
  });

  return (
    <div
      id="editor"
      ref={container}
      className="overflow-hidden w-screen h-dvh touch-none"
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
        <TapContext.Provider value={tap}>{children}</TapContext.Provider>
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
