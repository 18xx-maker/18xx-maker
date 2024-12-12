import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Svg from "@/components/Svg";

const SvgEditor = ({ width, height, children }) => {
  const initialState = useMemo(
    () => ({
      viewbox: {
        x: 0,
        y: 0,
        width,
        height,
      },
      pointer: {
        x: 0,
        y: 0,
      },
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    }),
    [height, width],
  );

  const svg = useRef(null);
  const [state, setState] = useState(initialState);

  const zoom = useCallback(
    (amount) => {
      const mult = 1.0 + amount / 800.0;
      const width = state.viewbox.width * mult;
      const height = state.viewbox.height * mult;
      const dw = state.viewbox.width - width;
      const dh = state.viewbox.height - height;

      const x = state.viewbox.x + 0.5 * dw;
      const y = state.viewbox.y + 0.5 * dh;

      return { x, y, width, height };
    },
    [state],
  );

  useEffect(() => {
    const el = svg.current;

    const onDown = (e) => {
      setState({
        ...state,
        pointer: { x: e.x, y: e.y },
      });
    };
    const onUp = () => {};
    const onMove = (e) => {
      if (e.buttons === 1) {
        const deltaX = e.x - state.pointer.x;
        const deltaY = e.y - state.pointer.y;

        const percentX = Math.abs(deltaX) / state.viewport.width;
        const percentY = Math.abs(deltaY) / state.viewport.height;

        const changeX =
          percentX * state.viewbox.width * (deltaX < 0 ? 1.0 : -1.0);
        const changeY =
          percentY * state.viewbox.height * (deltaY < 0 ? 1.0 : -1.0);

        const x = state.viewbox.x + changeX;
        const y = state.viewbox.y + changeY;

        setState({
          ...state,
          viewbox: { ...state.viewbox, x, y },
          pointer: { x: e.x, y: e.y },
        });
      }
    };
    const onWheel = (e) => {
      const amount = e.deltaY;

      setState({
        ...state,
        viewbox: zoom(amount),
      });
    };
    // const onResize = (e) =>
    //   console.log(e.type, e.target.innerWidth, e.target.innerHeight);
    const onResize = (e) => {
      setState({
        ...state,
        viewport: {
          width: e.target.innerWidth,
          height: e.target.innerHeight,
        },
      });
    };

    const onKeyDown = (e) => {
      const tag = event.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (e.key === "0") {
        setState(initialState);
      }
    };

    document.defaultView.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onMove);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("mousewheel", onWheel);

    return () => {
      document.defaultView.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("mousewheel", onWheel);
    };
  }, [svg, state, zoom, initialState]);

  const viewBox = `${state.viewbox.x} ${state.viewbox.y} ${state.viewbox.width} ${state.viewbox.height}`;
  return (
    <div
      id="editor"
      className="overflow-hidden w-screen h-screen print:w-auto print:h-auto touch-none"
    >
      <Svg
        ref={svg}
        className="printElement"
        width={`${state.viewport.width}px`}
        height={`${state.viewport.height}px`}
        viewBox={viewBox}
      >
        {children}
      </Svg>
    </div>
  );
};
export default SvgEditor;
