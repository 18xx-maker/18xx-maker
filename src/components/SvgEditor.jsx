import { useEffect, useMemo, useRef, useState } from "react";

import Svg from "@/components/Svg";

import { isControlTarget } from "@/util/keys";

const SvgEditor = ({ width, height, children }) => {
  const initial = useMemo(
    () => ({ x: 0, y: 0, width, height }),
    [width, height],
  );

  const svg = useRef(null);
  const pointer = useRef(null);
  const viewport = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [viewbox, setViewbox] = useState(initial);
  const [size, setSize] = useState(viewport.current);

  // The listeners are added once, they only use refs and functional updates
  useEffect(() => {
    const el = svg.current;

    // Only the pointer that started a drag may pan. Without this a move that
    // never saw its pointerdown (a press that started outside the svg, a second
    // finger, a cancelled drag) is measured from a stale position and the view
    // jumps. Capturing the pointer keeps the moves and the release coming to us.
    const onDown = (e) => {
      if (pointer.current || e.button !== 0) return;
      pointer.current = { id: e.pointerId, x: e.x, y: e.y };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // No active pointer to capture (synthetic events), panning still works
      }
    };
    const onUp = (e) => {
      if (pointer.current?.id !== e.pointerId) return;
      pointer.current = null;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };
    const onMove = (e) => {
      if (pointer.current?.id !== e.pointerId) return;
      // A release we never saw ends the drag
      if (e.buttons !== 1) {
        pointer.current = null;
        return;
      }

      const deltaX = e.x - pointer.current.x;
      const deltaY = e.y - pointer.current.y;
      pointer.current = { id: e.pointerId, x: e.x, y: e.y };

      setViewbox((box) => ({
        ...box,
        x: box.x - (deltaX / viewport.current.width) * box.width,
        y: box.y - (deltaY / viewport.current.height) * box.height,
      }));
    };
    const onWheel = (e) => {
      e.preventDefault();
      const mult = 1.0 + e.deltaY / 800.0;

      // Zoom around the center of the view
      setViewbox((box) => {
        const w = box.width * mult;
        const h = box.height * mult;
        return {
          x: box.x + 0.5 * (box.width - w),
          y: box.y + 0.5 * (box.height - h),
          width: w,
          height: h,
        };
      });
    };
    const onResize = () => {
      viewport.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setSize(viewport.current);
    };
    const onKeyDown = (e) => {
      if (isControlTarget(e)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "0") {
        setViewbox(initial);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [initial]);

  const viewBox = `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`;
  return (
    <div
      id="editor"
      className="overflow-hidden w-screen h-screen print:w-auto print:h-auto touch-none"
    >
      <Svg
        ref={svg}
        className="printElement"
        width={`${size.width}px`}
        height={`${size.height}px`}
        viewBox={viewBox}
      >
        {children}
      </Svg>
    </div>
  );
};
export default SvgEditor;
