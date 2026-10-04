import { useEffect, useRef } from "react";

import { isControlTarget } from "@/util/keys";

// Pointer, wheel and keyboard handling shared by the pan and zoom editors.
//
// The handlers are called with
//   onPan(dx, dy)  the pointer moved by this many pixels while dragging
//   onZoom(mult)   the wheel asked for this zoom factor (above 1 zooms out)
//   onReset()      the "v" key was pressed
// They are read from a ref, so they may change on every render.
export const usePanZoom = (ref, handlers) => {
  const pointer = useRef(null);
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const el = ref.current;

    // Only the pointer that started a drag may pan. Without this a move that
    // never saw its pointerdown (a press that started outside the element, a
    // second finger, a cancelled drag) is measured from a stale position and
    // the view jumps. Capturing the pointer keeps the moves and the release
    // coming to us.
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
      latest.current.onPan(deltaX, deltaY);
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
