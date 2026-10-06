import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useStore } from "react-redux";

import { useEditing } from "@/components/editor/Editor";

import { useOrientation } from "@/context/OrientationContext";
import TapContext from "@/context/TapContext";
import { useEditPanel } from "@/hooks/useEditPanel";
import { useSelectedHex } from "@/hooks/useSelectedHex";
import { createAlert, editGame } from "@/state";
import {
  isMoveClick,
  moveHex,
  selectedCoords,
  selectionFor,
  validCells,
} from "@/util/hexEdit";

// The corners of a hex of 150 across the flats, as the borders draw them
const CORNERS = [
  [-86.6025, 0],
  [-43.30125, -75],
  [43.30125, -75],
  [86.6025, 0],
  [43.30125, 75],
  [-43.30125, 75],
];

const ACCENT = "#2563eb";

// The points of a hex around its center, turned like the hexes of the map
const outline = (data, rotation, { x, y }) => {
  const cx = data.hexX(x, y);
  const cy = data.hexY(x, y);
  const turn = (rotation * Math.PI) / 180;
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  return CORNERS.map(([px, py]) => {
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    return `${(cx + rx * data.scale).toFixed(2)},${(cy + ry * data.scale).toFixed(2)}`;
  }).join(" ");
};

// The layer of the editable map that picks hexes: a faint outline under the
// pointer, the group that is selected, and a target on every position of the
// map and the row and column after it. A click selects the group of the hex
// (see useSelectedHex), a click with Cmd (Ctrl away from macOS) moves the hex
// into the selected group or out of it. Only for the pan and zoom map with the
// edit panel open (usePanZoom hands the taps to it, the pointer is captured by
// the svg so no click reaches the cells); the printed and exported maps have
// none of it.
const Active = ({ data, game, variation }) => {
  const { t } = useTranslation();
  const store = useStore();
  const dispatch = useDispatch();
  const rotation = useOrientation();
  const { hex: selected, select, clear } = useSelectedHex();
  const tap = useContext(TapContext);
  const [hover, setHover] = useState(null);

  const cells = useMemo(
    () =>
      validCells(data).map((cell) => ({
        ...cell,
        points: outline(data, rotation, cell),
      })),
    [data, rotation],
  );
  const byCoord = useMemo(
    () => Object.fromEntries(cells.map((cell) => [cell.coord, cell])),
    [cells],
  );

  // The targets do not draw again when only the hover changes
  const targets = useMemo(
    () =>
      cells.map((cell) => (
        <polygon
          key={cell.coord}
          data-coord={cell.coord}
          points={cell.points}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onPointerEnter={() => setHover(cell.coord)}
        />
      )),
    [cells],
  );

  const onTap = (target, event) => {
    const coord = target?.closest?.("[data-coord]")?.dataset.coord;
    if (!coord) return;
    const current = store.getState().game;

    if (selected && isMoveClick(event)) {
      const result = moveHex(current, variation, selected, coord);
      if (result.blocked) {
        dispatch(
          createAlert(
            t("hexEditor.blocked.title"),
            t(`hexEditor.blocked.${result.blocked}`, { coord }),
            "warning",
          ),
        );
        return;
      }
      dispatch(editGame(() => result.game));
      if (result.anchor) select(result.anchor);
      else clear();
      return;
    }
    select(selectionFor(current, variation, coord));
  };
  const latest = useRef(onTap);
  latest.current = onTap;

  // The svg of the editor calls this on a tap
  useEffect(() => {
    tap.current = (target, event) => latest.current(target, event);
    return () => {
      tap.current = null;
    };
  }, [tap]);

  const picked = selectedCoords(game, variation, selected)
    .map((coord) => byCoord[coord])
    .filter(Boolean);
  // A position that is on no group yet is only a target
  const pending = picked.length === 1 && picked[0].coord === selected;
  const hovered = hover && byCoord[hover];

  return (
    <g
      data-testid="hex-overlay"
      aria-hidden="true"
      onContextMenu={(event) => event.preventDefault()}
      onPointerLeave={() => setHover(null)}
    >
      {picked.map((cell) => (
        <polygon
          key={cell.coord}
          data-testid="hex-selected"
          data-selected={cell.coord}
          points={cell.points}
          fill={ACCENT}
          fillOpacity={0.15}
          stroke={ACCENT}
          strokeWidth={4 * data.scale}
          strokeDasharray={
            pending ? `${6 * data.scale} ${4 * data.scale}` : undefined
          }
          strokeLinejoin="round"
          pointerEvents="none"
        />
      ))}
      {hovered && (
        <polygon
          data-testid="hex-hover"
          data-hover={hovered.coord}
          points={hovered.points}
          fill={ACCENT}
          fillOpacity={0.1}
          stroke={ACCENT}
          strokeOpacity={0.6}
          strokeWidth={3 * data.scale}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      )}
      {targets}
    </g>
  );
};

const HexOverlay = ({ interactive, ...props }) =>
  interactive ? <Gate {...props} /> : null;

const Gate = (props) => {
  const editing = useEditing();
  const { open } = useEditPanel();
  return editing && open ? <Active {...props} /> : null;
};

export default HexOverlay;
