import { useEffect, useRef, useState } from "react";

import Svg from "@/components/svg/Svg";

import { TOOLBAR_INSET, usePanZoom } from "@/hooks/usePanZoom";

// The view box that fits the content in the window below the toolbar. padding
// is the space kept free around the content to start, as a fraction of the
// content.
const fit = (width, height, padding, vw, vh) => {
  const inset = Math.min(TOOLBAR_INSET, vh / 4);
  const avail = vh - inset;
  const scale = Math.min(
    vw / (width * (1 + 2 * padding)),
    avail / (height * (1 + 2 * padding)),
  );
  return {
    x: width / 2 - vw / 2 / scale,
    y: height / 2 - (inset + avail / 2) / scale,
    width: vw / scale,
    height: vh / scale,
  };
};

const SvgEditor = ({ width, height, padding = 0, children }) => {
  const svg = useRef(null);
  const viewport = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const initial = () =>
    fit(
      width,
      height,
      padding,
      viewport.current.width,
      viewport.current.height,
    );
  const [viewbox, setViewbox] = useState(initial);
  const [size, setSize] = useState(viewport.current);
  // Whether the view was moved since it was fitted, a window resize keeps a
  // moved view and refits an untouched one
  const touched = useRef(false);

  usePanZoom(svg, {
    onPan: (deltaX, deltaY) => {
      touched.current = true;
      setViewbox((box) => ({
        ...box,
        x: box.x - (deltaX / viewport.current.width) * box.width,
        y: box.y - (deltaY / viewport.current.height) * box.height,
      }));
    },
    // Zoom around the center of the view, or the point of a pinch
    onZoom: (mult, focus) => {
      touched.current = true;
      setViewbox((box) => {
        const w = box.width * mult;
        const h = box.height * mult;
        const fx = focus ? focus.x / viewport.current.width : 0.5;
        const fy = focus ? focus.y / viewport.current.height : 0.5;
        return {
          x: box.x + fx * (box.width - w),
          y: box.y + fy * (box.height - h),
          width: w,
          height: h,
        };
      });
    },
    onReset: () => {
      touched.current = false;
      setViewbox(initial());
    },
  });

  useEffect(() => {
    const onResize = () => {
      const old = viewport.current;
      const next = { width: window.innerWidth, height: window.innerHeight };
      viewport.current = next;
      setSize(next);
      if (!touched.current) {
        setViewbox(fit(width, height, padding, next.width, next.height));
        return;
      }
      // Keep the scale and the center of the view
      setViewbox((box) => {
        const width = (box.width * next.width) / old.width;
        const height = (box.height * next.height) / old.height;
        return {
          x: box.x + (box.width - width) / 2,
          y: box.y + (box.height - height) / 2,
          width,
          height,
        };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [width, height, padding]);

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
