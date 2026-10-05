import { useEffect, useRef } from "react";

import { isControlTarget } from "@/util/keys";

// Pointer, wheel and keyboard handling shared by the pan and zoom editors.
//
// The handlers are called with
//   onPan(dx, dy)  the pointer moved by this many pixels while dragging
//   onZoom(mult)   the wheel or a pinch asked for this zoom factor (above 1
//                  zooms out)
//   onReset()      the "v" key was pressed
// They are read from a ref, so they may change on every render.
export const usePanZoom = (ref, handlers) => {
  const pointers = useRef(new Map());
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const el = ref.current;

    // The distance between the two fingers of a pinch, 0 for one pointer
    const spread = () => {
      const [a, b] = [...pointers.current.values()];
      return b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };

    // Only pointers that started on the element may pan, otherwise a move
    // that never saw its pointerdown (a press that started outside, a
    // cancelled drag) is measured from a stale position and the view jumps.
    // Capturing the pointer keeps the moves and the release coming to us.
    // One pointer pans, two pointers (fingers) pan and pinch to zoom.
    const onDown = (e) => {
      if (e.button !== 0 || pointers.current.size >= 2) return;
      pointers.current.set(e.pointerId, { x: e.x, y: e.y });
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // No active pointer to capture (synthetic events), panning still works
      }
    };
    const onUp = (e) => {
      if (!pointers.current.delete(e.pointerId)) return;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };
    const onMove = (e) => {
      const last = pointers.current.get(e.pointerId);
      if (!last) return;
      // A release we never saw ends the drag
      if (e.buttons !== 1) {
        pointers.current.delete(e.pointerId);
        return;
      }

      const before = spread();
      pointers.current.set(e.pointerId, { x: e.x, y: e.y });
      const count = pointers.current.size;

      // Each finger moves half of the movement of their midpoint
      latest.current.onPan((e.x - last.x) / count, (e.y - last.y) / count);
      const after = spread();
      if (before > 0 && after > 0) latest.current.onZoom(before / after);
    };
    const onWheel = (e) => {
      e.preventDefault();
      latest.current.onZoom(1.0 + e.deltaY / 800.0);
    };
    const onKeyDown = (e) => {
      if (isControlTarget(e)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "v") {
        latest.current.onReset();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [ref]);
};

export default usePanZoom;
