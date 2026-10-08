import { useContext, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";

import { useEditing } from "@/components/editor/Editor";

import TapContext from "@/context/TapContext";
import { tiles as library } from "@/data";
import { useEditPanel } from "@/hooks/useEditPanel";
import { useSelectedTile } from "@/hooks/useSelectedTile";
import { editGame } from "@/state";
import { addTile, nextTileId } from "@/util/tileEdit";

// The corners of a tile, as the cut borders of the sheet draw them
const POINTS =
  "-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5";

const ACCENT = "#2563eb";
const GHOST = "#8a93a3";

// Whether the tiles page is edited with the edit panel open. Printing,
// ?print=true and render mode have none of the layer, so they print as before.
export const useTilesEditing = () => {
  const editing = useEditing();
  const { open } = useEditPanel();
  return editing && open;
};

// What a tap on the tile sheets does, once per tiles page (the pages of the
// sheet come and go as the game changes, this stays): a tap on a tile selects
// it on the Tiles tab (see useSelectedTile), a tap on the cell after the last
// tile adds a new tile and selects it. The pan and zoom view hands the taps
// over through TapContext (the pointer is captured, no click reaches the
// cells).
const Tap = () => {
  const store = useStore();
  const tap = useContext(TapContext);
  const { select } = useSelectedTile();

  const onTap = (target) => {
    const cell = target?.closest?.("[data-tile],[data-next]");
    if (!cell) return;
    if (cell.dataset.tile !== undefined) {
      select(cell.dataset.tile);
      return;
    }
    const current = store.getState().game;
    const result = addTile(current, nextTileId(current, library), library);
    store.dispatch(
      editGame((latest) => (latest === current ? result.game : latest)),
    );
    select(result.id);
  };
  const latest = useRef(onTap);
  latest.current = onTap;

  useEffect(() => {
    tap.current = (target, event) => latest.current(target, event);
    return () => {
      tap.current = null;
    };
  }, [tap]);

  return null;
};

export const TilesTap = () => (useTilesEditing() ? <Tap /> : null);

const Cell = ({ c, index, children, ...props }) => (
  <g
    transform={`translate(${c.getX(index)} ${c.getY(index)}) scale(${c.hexWidth / 150})`}
    {...props}
  >
    {children}
  </g>
);

const Active = ({ cells, next, c }) => {
  const { tile: selected } = useSelectedTile();
  const [hover, setHover] = useState(null);
  // One user unit of the page, in the units of a tile
  const k = 150 / c.hexWidth;

  return (
    <g
      data-testid="tiles-overlay"
      aria-hidden="true"
      onContextMenu={(event) => event.preventDefault()}
      onPointerLeave={() => setHover(null)}
    >
      {cells.map(({ id, index }) => (
        <Cell key={index} c={c} index={index}>
          {id === selected && (
            <polygon
              data-testid="tile-selected"
              data-selected={id}
              points={POINTS}
              fill={ACCENT}
              fillOpacity={0.15}
              stroke={ACCENT}
              strokeWidth={4 * k}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
          {hover === index && id !== selected && (
            <polygon
              data-testid="tile-hover"
              points={POINTS}
              fill={ACCENT}
              fillOpacity={0.1}
              stroke={ACCENT}
              strokeOpacity={0.6}
              strokeWidth={3 * k}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
          <polygon
            data-tile={id}
            points={POINTS}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onPointerEnter={() => setHover(index)}
          />
        </Cell>
      ))}
      {next !== null && (
        <Cell c={c} index={next}>
          <polygon
            data-next=""
            onPointerEnter={() => setHover(null)}
            data-testid="tile-next"
            points={POINTS}
            fill="transparent"
            stroke={GHOST}
            strokeWidth={2 * k}
            strokeDasharray={`${8 * k} ${6 * k}`}
            strokeLinejoin="round"
            style={{ cursor: "pointer" }}
          />
          <path
            d="M-18,0H18M0,-18V18"
            stroke={GHOST}
            strokeWidth={4 * k}
            strokeLinecap="round"
            pointerEvents="none"
          />
        </Cell>
      )}
    </g>
  );
};

// The layer of one page of the tile sheet: a target on every printed tile with
// the outline of the selected tile (every copy of it) and of the tile under
// the pointer, and a dashed "+" cell at the position `next` for a new tile.
// `cells` are { id, index } for the tiles of the page. Drawn last in the svg
// of the page, in the units of the sheet.
const TilesOverlay = (props) =>
  useTilesEditing() ? <Active {...props} /> : null;

export default TilesOverlay;
