import { memo, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Tile from "@/components/Tile";
import Map from "@/components/map/Map";
import Svg from "@/components/svg/Svg";
import GameMapCompanyToken from "@/components/tokens/GameMapCompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { useOrientation } from "@/context/OrientationContext";
import { tiles as library } from "@/data";
import { usePanZoom } from "@/hooks/usePanZoom";
import { getTile, multiDefaultTo } from "@/util";
import { outline, toHexLocal } from "@/util/hexEdit";
import { getMapData, toAlpha, toCoords } from "@/util/map";

export const ACCENT = "#2563eb";
const WARN = "#dc2626";
const CENTER = { hexX: () => 0, hexY: () => 0, scale: 1 };

// A tile of the game or of the library (also by the id without its variant)
export const knownTile = (game, id) =>
  !!getTile(library, game.tiles || {}, id).color;

export const sameToken = (a, b) =>
  !!a && !!b && a.token === b.token && a.x === b.x && a.y === b.y;

export const knownCompany = (game, abbrev) =>
  (game.companies || []).some((company) => company.abbrev === abbrev);

// The hexes of the map by coordinate, with the outline that picks them. No
// prototype: a hex id of an event ("constructor") is never found on it.
const mapCells = (data, rotation) => {
  const cells = Object.create(null);
  for (const group of data.hexes || []) {
    for (const coords of group.hexes || []) {
      const [x, y] = toCoords(coords);
      const coord = `${toAlpha(y)}${x}`;
      cells[coord] = { x, y, coord, points: outline(data, rotation, { x, y }) };
    }
  }
  return cells;
};

// The point of the svg under a pointer event
const svgPoint = (svg, clientX, clientY) => {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
};

const TilePlaceholder = ({ id, rotation }) => (
  <g data-placeholder="tile">
    <polygon
      points={outline(CENTER, rotation, { x: 0, y: 0 })}
      fill="#fff"
      fillOpacity={0.85}
      stroke={WARN}
      strokeWidth={3}
      strokeDasharray="10 6"
    />
    <text textAnchor="middle" dominantBaseline="middle" fontSize={20}>
      {id}
    </text>
  </g>
);

// The token of a company of the game, a labeled placeholder for any other
export const CompanyToken = ({ game, abbrev, width }) =>
  knownCompany(game, abbrev) ? (
    <ColorContext.Provider value="companies">
      <GameMapCompanyToken abbrev={abbrev} width={width} />
    </ColorContext.Provider>
  ) : (
    <g data-placeholder="company">
      <Token label={abbrev} color="white" labelColor="black" width={width} />
    </g>
  );

const PlacedToken = ({ game, hex, index, token, width, selected }) => (
  <g
    data-token={token.token}
    data-token-hex={hex}
    data-token-index={index}
    transform={`translate(${token.x} ${token.y})`}
    style={{ cursor: "pointer" }}
  >
    <CompanyToken game={game} abbrev={token.token} width={width} />
    {selected && (
      <circle
        data-selected-token={hex}
        r={width + 4}
        fill="none"
        stroke={ACCENT}
        strokeWidth={4}
        pointerEvents="none"
      />
    )}
  </g>
);

const BaseMap = memo(Map);

const at = (data, { x, y }) =>
  `translate(${data.hexX(x, y)} ${data.hexY(x, y)}) scale(${data.scale})`;

const TileLayerView = ({ game, tiles, cells, data, rotation }) =>
  Object.entries(tiles).map(
    ([hex, placed]) =>
      cells[hex] && (
        <g
          key={hex}
          data-tile-hex={hex}
          data-tile={placed.tile}
          transform={`${at(data, cells[hex])} rotate(${60 * placed.rotation})`}
        >
          {knownTile(game, placed.tile) ? (
            <Tile id={placed.tile} gameTiles={game.tiles} border />
          ) : (
            <TilePlaceholder id={placed.tile} rotation={rotation} />
          )}
        </g>
      ),
  );
const TileLayer = memo(TileLayerView);

const TargetLayerView = ({ cells }) =>
  Object.values(cells).map((cell) => (
    <polygon
      key={cell.coord}
      data-coord={cell.coord}
      points={cell.points}
      fill="transparent"
      style={{ cursor: "pointer" }}
    />
  ));
const TargetLayer = memo(TargetLayerView);

const TokenLayerView = ({ game, tokens, cells, data, width, selected }) =>
  Object.entries(tokens).map(
    ([hex, list]) =>
      cells[hex] && (
        <g key={hex} transform={at(data, cells[hex])}>
          {list.map((token, i) => (
            <PlacedToken
              key={`${token.token}-${token.x}-${token.y}-${i}`}
              game={game}
              hex={hex}
              index={i}
              token={token}
              width={width}
              selected={
                selected?.hex === hex && sameToken(selected.token, token)
              }
            />
          ))}
        </g>
      ),
  );
const TokenLayer = memo(TokenLayerView);

// The board map: the print map of the game with the placed tiles and tokens
// over it and a target on every hex. Pan with a drag, zoom with the wheel or
// a pinch, "v" fits it again. A tap calls onTap with { hex, x, y } (the point
// in the units of the hex) or { hex, token } for a placed token.
const PlayMap = ({ game, config, state, selected, onTap }) => {
  const { t } = useTranslation();
  const rotation = useOrientation();
  const svg = useRef(null);
  const data = useMemo(
    () => getMapData(game, config.coords, config.tiles.mapWidth, 0),
    [game, config.coords, config.tiles.mapWidth],
  );
  const full = {
    x: 0,
    y: 0,
    width: data.totalWidth || 1,
    height: data.totalHeight || 1,
  };
  const [box, setBox] = useState(full);
  const cells = useMemo(() => mapCells(data, rotation), [data, rotation]);
  const width = multiDefaultTo(25, game.info?.cityWidth);

  const ctm = () => svg.current.getScreenCTM();
  usePanZoom(svg, {
    onPan: (dx, dy) => {
      const m = ctm();
      setBox((b) => ({ ...b, x: b.x - dx / m.a, y: b.y - dy / m.d }));
    },
    onZoom: (mult, focus) => {
      const rect = svg.current.getBoundingClientRect();
      const f = focus
        ? svgPoint(svg.current, rect.left + focus.x, rect.top + focus.y)
        : null;
      setBox((b) => {
        const cx = f ? f.x : b.x + b.width / 2;
        const cy = f ? f.y : b.y + b.height / 2;
        return {
          x: cx - (cx - b.x) * mult,
          y: cy - (cy - b.y) * mult,
          width: b.width * mult,
          height: b.height * mult,
        };
      });
    },
    onReset: () => setBox(full),
    onTap: (target, event) => {
      const placed = target?.closest?.("[data-token-index]");
      if (placed) {
        const hex = placed.dataset.tokenHex;
        const token = (state.tokens[hex] || [])[placed.dataset.tokenIndex];
        if (token) onTap({ hex, token });
        return;
      }
      const cell = cells[target?.closest?.("[data-coord]")?.dataset.coord];
      if (!cell) return;
      const point = svgPoint(svg.current, event.clientX, event.clientY);
      onTap({ hex: cell.coord, ...toHexLocal(data, rotation, cell, point) });
    },
  });

  const offMap = [
    ...Object.keys(state.tiles),
    ...Object.keys(state.tokens).filter((hex) => state.tokens[hex].length),
  ].filter((hex, i, list) => !cells[hex] && list.indexOf(hex) === i);
  const picked = selected && cells[selected.hex];

  // Only the view box changes while panning and zooming: the layers are
  // memoized on what they draw
  return (
    <div className="relative h-full w-full">
      <Svg
        ref={svg}
        data-play-map=""
        role="img"
        aria-label={t("play.board.map")}
        className="h-full w-full touch-none select-none"
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      >
        {data.map && (
          <>
            <BaseMap name="play" game={game} config={config} variation={0} />
            <TileLayer
              game={game}
              tiles={state.tiles}
              cells={cells}
              data={data}
              rotation={rotation}
            />
            <TargetLayer cells={cells} />
            {picked && (
              <polygon
                data-selected={picked.coord}
                points={picked.points}
                fill={ACCENT}
                fillOpacity={0.12}
                stroke={ACCENT}
                strokeWidth={4 * data.scale}
                strokeLinejoin="round"
                pointerEvents="none"
              />
            )}
            <TokenLayer
              game={game}
              tokens={state.tokens}
              cells={cells}
              data={data}
              width={width}
              selected={selected?.token ? selected : null}
            />
          </>
        )}
      </Svg>
      {!data.map && (
        <p className="absolute top-2 left-2 text-sm">{t("play.board.noMap")}</p>
      )}
      {offMap.length > 0 && (
        <p
          data-testid="play-off-map"
          className="absolute bottom-2 left-2 rounded-md border bg-background/90 px-2 py-1 text-xs text-destructive"
        >
          {t("play.board.offMap", { hexes: offMap.join(", ") })}
        </p>
      )}
    </div>
  );
};

export default PlayMap;
