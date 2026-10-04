import { useEffect, useMemo, useRef, useState } from "react";

import Svg from "@/components/Svg";

import { usePanZoom } from "@/hooks/use-pan-zoom";

const SvgEditor = ({ width, height, children }) => {
  const initial = useMemo(
    () => ({ x: 0, y: 0, width, height }),
    [width, height],
  );

  const svg = useRef(null);
  const viewport = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [viewbox, setViewbox] = useState(initial);
  const [size, setSize] = useState(viewport.current);

  usePanZoom(svg, {
    onPan: (deltaX, deltaY) =>
      setViewbox((box) => ({
        ...box,
        x: box.x - (deltaX / viewport.current.width) * box.width,
        y: box.y - (deltaY / viewport.current.height) * box.height,
      })),
    // Zoom around the center of the view
    onZoom: (mult) =>
      setViewbox((box) => {
        const w = box.width * mult;
        const h = box.height * mult;
        return {
          x: box.x + 0.5 * (box.width - w),
          y: box.y + 0.5 * (box.height - h),
          width: w,
          height: h,
        };
      }),
    onReset: () => setViewbox(initial),
  });

  useEffect(() => {
    const onResize = () => {
      viewport.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setSize(viewport.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
