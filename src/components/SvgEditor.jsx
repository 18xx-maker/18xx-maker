import { useEffect, useMemo, useRef, useState } from "react";

import Svg from "@/components/Svg";

import { isControlTarget } from "@/util/keys";

const SvgEditor = ({ width, height, children }) => {
  const initial = useMemo(
    () => ({ x: 0, y: 0, width, height }),
    [width, height],
  );

  const svg = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const viewport = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [viewbox, setViewbox] = useState(initial);
  const [size, setSize] = useState(viewport.current);

  // The listeners are added once, they only use refs and functional updates
  useEffect(() => {
    const el = svg.current;

    const onDown = (e) => {
      pointer.current = { x: e.x, y: e.y };
    };
    const onMove = (e) => {
      if (e.buttons !== 1) return;

      const deltaX = e.x - pointer.current.x;
      const deltaY = e.y - pointer.current.y;
      pointer.current = { x: e.x, y: e.y };

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
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
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
