import { Component, memo, useRef } from "react";
import { useTranslation } from "react-i18next";

import Hex from "@/components/Hex";
import { SideHandle } from "@/components/hexEditor/SidePicker";
import {
  DRAGGABLE_KEYS,
  SIDES,
  elementPoint,
  elementsOf,
} from "@/components/hexEditor/hexModel";

import ColorContext from "@/context/ColorContext";
import OrientationContext from "@/context/OrientationContext";

const ACCENT = "#2563eb";

// The pointer has to move this far (in pixels of the screen) before a press
// on an element is a drag and not a click
const DRAG_START = 4;

// A key that changes when the value does, so a boundary tries again
const keyOf = (value) => {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return String(Math.random());
  }
};

// A hex the map cannot draw (an edit that fits the JSON but not the schema)
// shows a note rather than taking the panel down. It tries again once the hex
// it was given changes.
class CanvasBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (
      this.state.failed &&
      keyOf(previous.value) !== keyOf(this.props.value)
    ) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? (
      <text
        data-testid="hex-canvas-failed"
        textAnchor="middle"
        fontSize={9}
        className="fill-destructive"
      >
        {this.props.message}
      </text>
    ) : (
      this.props.children
    );
  }
}

// The hex as the map draws it: the Hex of the print output, in the contexts
// the map gives it (the orientation of the map, the colors of the map).
const Drawing = memo(({ value, orientation, tile }) => (
  <OrientationContext.Provider value={orientation}>
    <ColorContext.Provider value={tile ? "tile" : "map"}>
      <Hex hex={value} border={true} map={!tile} />
    </ColorContext.Provider>
  </OrientationContext.Provider>
));
Drawing.displayName = "Drawing";

// The hex being edited, drawn by the real Hex, with a layer above it for the
// pointer: a button on each edge (a click on one and then another draws the
// track between them) and a target on each element, that picks it. The layer
// is only for the editor, the hex is drawn without it everywhere else. A tile
// is drawn as the tile sheets draw it; with readOnly there is only the drawing
// (a tile of the library, which is not edited).
const HexCanvas = ({
  value,
  tile = false,
  readOnly = false,
  orientation = 0,
  selected,
  onSelect,
  pending = null,
  onEdge,
  elementLabel,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const { t } = useTranslation();
  const elements = elementsOf(value);
  const svg = useRef(null);
  // The press on an element: where it started (screen) and whether it moved
  const press = useRef(null);
  const dragged = useRef(false);

  // Pixels of the screen to units of the drawing
  const scale = () => svg.current?.getScreenCTM?.()?.a || 1;

  const down = (event, item) => {
    dragged.current = false;
    if (event.button !== 0 || !onDrag || !DRAGGABLE_KEYS.includes(item.key)) {
      return;
    }
    press.current = { ...item, x: event.clientX, y: event.clientY, on: false };
    // The focus stays in the editor, so its keys (undo) work after a drag
    svg.current?.focus({ preventScroll: true });
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // A pointer that is gone cannot be captured; the drag still works
    }
  };

  const move = (event) => {
    const p = press.current;
    if (!p) return;
    const dx = event.clientX - p.x;
    const dy = event.clientY - p.y;
    if (!p.on) {
      if (Math.hypot(dx, dy) < DRAG_START) return;
      p.on = true;
      dragged.current = true;
      onSelect({ key: p.key, index: p.index });
      onDragStart?.({ key: p.key, index: p.index });
    }
    const k = scale();
    onDrag({ key: p.key, index: p.index }, dx / k, dy / k);
  };

  const up = (event) => {
    const p = press.current;
    press.current = null;
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Already released
    }
    if (p?.on) onDragEnd?.({ key: p.key, index: p.index });
  };

  return (
    <svg
      ref={svg}
      tabIndex={-1}
      viewBox="-100 -100 200 200"
      role="group"
      aria-label={t("hexEditor.form.canvas")}
      className="size-full max-h-72 touch-manipulation focus:outline-hidden"
      data-testid="hex-canvas"
      data-pending={pending ?? undefined}
    >
      <CanvasBoundary value={value} message={t("hexEditor.form.canvasFailed")}>
        <Drawing value={value} orientation={orientation} tile={tile} />
      </CanvasBoundary>
      {!readOnly && (
        <>
          <g data-testid="hex-canvas-elements" aria-hidden="true">
            {elements.map(({ key, index, element }) => {
              const at = elementPoint(key, element, index, orientation, value);
              const on = selected?.key === key && selected?.index === index;
              return (
                <circle
                  key={`${key}-${index}`}
                  data-element={`${key}:${index}`}
                  cx={at.x}
                  cy={at.y}
                  r={9}
                  fill={on ? ACCENT : "transparent"}
                  fillOpacity={0.2}
                  stroke={on ? ACCENT : "transparent"}
                  strokeWidth={on ? 3 : 0}
                  className={`${DRAGGABLE_KEYS.includes(key) ? "cursor-grab" : "cursor-pointer"} touch-none hover:stroke-primary hover:[stroke-width:2px]`}
                  onPointerDown={(event) => down(event, { key, index })}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={(event) => {
                    up(event);
                    dragged.current = false;
                  }}
                  onClick={() => {
                    // A drag ends in a click on the element: it is not a pick
                    if (dragged.current) dragged.current = false;
                    else onSelect({ key, index });
                  }}
                >
                  <title>{elementLabel(key, index)}</title>
                </circle>
              );
            })}
          </g>
          <g data-testid="hex-canvas-edges">
            {SIDES.map((side) => (
              <SideHandle
                key={side}
                side={side}
                orientation={orientation}
                pressed={pending === side}
                label={t(
                  pending === null
                    ? "hexEditor.form.edge"
                    : pending === side
                      ? "hexEditor.form.edgeCancel"
                      : "hexEditor.form.edgeTo",
                  { side, from: pending },
                )}
                onPress={onEdge}
                distance={66}
                size={9}
                hit={20}
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
};

export default HexCanvas;
