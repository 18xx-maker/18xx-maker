import { useEffect, useRef } from "react";

import { isControlTarget } from "@/util/keys";

// The space at the top of the window taken by the floating editor toolbar. The
// editors start with their content below it.
export const TOOLBAR_INSET = 72;

// How far a pointer may move and still be a tap, in pixels
export const TAP_DISTANCE = 4;

// Pointer, wheel and keyboard handling shared by the pan and zoom editors.
//
// The handlers are called with
//   onPan(dx, dy)  the pointer moved by this many pixels while dragging
//   onZoom(mult, focus)  the wheel or a pinch asked for this zoom factor (above
//                  1 zooms out). A pinch also passes the {x, y} point between
//                  the fingers, relative to the element, to zoom around
//   onReset()      the "v" key was pressed
//   onTap(target, event)  a single pointer went down and up on the element
//                  without moving (under TAP_DISTANCE pixels, no second
//                  pointer): target is where the pointer went down, event is
//                  the pointerup. The pointer is captured by the element, so
//                  the target of the up (and of a click) is always the
//                  element itself.
// They are read from a ref, so they may change on every render.
export const usePanZoom = (ref, handlers) => {
  const pointers = useRef(new Map());
  // The press that may still be a tap: where it started and on what
  const tap = useRef(null);
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
      // A second pointer makes a gesture, not a tap
      tap.current =
        pointers.current.size === 0
          ? { id: e.pointerId, target: e.target, x: e.x, y: e.y }
          : null;
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
      const start = tap.current;
      if (pointers.current.size === 0) tap.current = null;
      if (
        e.type === "pointerup" &&
        start?.id === e.pointerId &&
        Math.hypot(e.x - start.x, e.y - start.y) < TAP_DISTANCE
      ) {
        latest.current.onTap?.(start.target, e);
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

      // A press that moved is a drag, even when it comes back
      const start = tap.current;
      if (start && Math.hypot(e.x - start.x, e.y - start.y) >= TAP_DISTANCE) {
        tap.current = null;
      }

      const before = spread();
      pointers.current.set(e.pointerId, { x: e.x, y: e.y });
      const count = pointers.current.size;

      // Each finger moves half of the movement of their midpoint
      latest.current.onPan((e.x - last.x) / count, (e.y - last.y) / count);
      const after = spread();
      if (before > 0 && after > 0) {
        const [a, b] = [...pointers.current.values()];
        const rect = el.getBoundingClientRect();
        latest.current.onZoom(before / after, {
          x: (a.x + b.x) / 2 - rect.left,
          y: (a.y + b.y) / 2 - rect.top,
        });
      }
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

    // A finger we never saw lift (the window lost focus mid-gesture) would
    // leave a phantom pointer that turns the next drag into a pinch
    const clear = () => {
      pointers.current.clear();
      tap.current = null;
    };
    const onVisibility = () => {
      if (document.hidden) clear();
    };

    // The editor never scrolls, the view moves by transform. Keep the page
    // and the element at 0,0 (focus, a text selection or a touch that chains
    // past the element would otherwise scroll them instead of the view).
    const lock = document.documentElement;
    const body = document.body;
    const before = [lock.style.overflow, body.style.overflow];
    lock.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const onScroll = () => {
      if (el.scrollTop || el.scrollLeft) el.scrollTo(0, 0);
      if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", clear);
    window.addEventListener("scroll", onScroll);
    el.addEventListener("scroll", onScroll);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      clear();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", clear);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("scroll", onScroll);
      [lock.style.overflow, body.style.overflow] = before;
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [ref]);
};

export default usePanZoom;
