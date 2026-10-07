import { Fragment, memo, useId } from "react";

import * as R from "ramda";

import Position from "@/components/Position";
import Boomtown from "@/components/atoms/Boomtown";
import Border from "@/components/atoms/Border";
import Bridge from "@/components/atoms/Bridge";
import CenterTown from "@/components/atoms/CenterTown";
import City from "@/components/atoms/City";
import Company from "@/components/atoms/Company";
import Divide from "@/components/atoms/Divide";
import Good from "@/components/atoms/Good";
import Hex from "@/components/atoms/Hex";
import HexBorder from "@/components/atoms/HexBorder";
import Icon from "@/components/atoms/Icon";
import Id from "@/components/atoms/Id";
import Industry from "@/components/atoms/Industry";
import Label from "@/components/atoms/Label";
import MediumCity from "@/components/atoms/MediumCity";
import Name from "@/components/atoms/Name";
import OffBoardRevenue from "@/components/atoms/OffBoardRevenue";
import RouteBonus from "@/components/atoms/RouteBonus";
import Terrain from "@/components/atoms/Terrain";
import Town from "@/components/atoms/Town";
import Track from "@/components/atoms/Track";
import Tunnel from "@/components/atoms/Tunnel";
import TunnelEntrance from "@/components/atoms/TunnelEntrance";
import Value from "@/components/atoms/Value";
import Shape from "@/components/atoms/shapes/Shape";
import GameMapCompanyToken from "@/components/tokens/GameMapCompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import HexContext from "@/context/HexContext";
import { useOrientation } from "@/context/OrientationContext";
import PhaseContext from "@/context/PhaseContext";
import { useConfig } from "@/hooks";
import hexClip from "@/util/hexClip";

const concat = R.unapply(R.reduce(R.concat, []));

const isOrdered = (e) => e?.order === true || typeof e?.order === "number";
const isUnordered = (e) => !isOrdered(e);
const orderValue = (e) => (e.order === true ? Infinity : e.order);
const toList = (d) => (!d ? [] : Array.isArray(d) ? d : [d]);

// Normal render order of the slots, so equal orders tie in the usual type order
const SLOTS = [
  "bgShapes",
  "goods",
  "tunnelEntrances",
  "cities",
  "mediumCities",
  "towns",
  "boomtowns",
  "centerTowns",
  "values",
  "labels",
  "tokens",
  "terrain",
  "icons",
  "outsideCities",
  "bonus",
  "industries",
  "companies",
  "names",
  "shapes",
  "tunnels",
  "bridges",
  "offBoardRevenue",
];

const sortOrdered = (list) =>
  R.sortWith(
    [R.ascend((o) => o.order), R.ascend((o) => o.rank), R.ascend((o) => o.i)],
    list,
  ).map((o) => o.node);

// Borders stay in their own layer under the tracks, ordered or not
const borderSlot = (data, render) => (
  <Position data={toList(data)}>{render}</Position>
);

const rest = (data, render, type) => (
  <Position data={toList(data)} type={type} pick={isUnordered}>
    {render}
  </Position>
);

const makeTrack = (track) => (
  <Position key={`track-${track.id}`} data={track}>
    {(t) => <Track {...t} />}
  </Position>
);
const makeBorder = (track) => (
  <Position key={`track-border-${track.id}`} data={track}>
    {(t) => <Track {...t} border={true} />}
  </Position>
);

// halves: more halves of the hex to keep, on top of hex.half. The map passes the
// ones its trimmed edges leave.
const HexTile = ({
  hex,
  id,
  clipPath,
  border,
  transparent,
  map,
  opacity,
  halves: extraHalves,
}) => {
  const rotation = useOrientation();
  const { config } = useConfig();
  const seamId = useId();
  const tileCompanies = config.tileCompanies;

  if (hex === undefined || hex === null) {
    return null;
  }

  let [idBase, idExtra] = (id || "").split("|");

  let getTracks = R.converge(concat, [
    R.compose(
      R.map(makeBorder),
      R.filter((t) => t.cross === "bottom"),
    ),
    R.compose(
      R.map(makeTrack),
      R.filter((t) => t.cross === "bottom"),
    ),
    R.compose(
      R.map(makeBorder),
      R.filter((t) => t.cross === undefined || t.cross === "under"),
    ),
    R.compose(
      R.map(makeTrack),
      R.filter((t) => t.cross === "under"),
    ),
    R.compose(
      R.map(makeBorder),
      R.filter((t) => t.cross === "over"),
    ),
    R.compose(
      R.map(makeTrack),
      R.filter((t) => t.cross === undefined || t.cross === "over"),
    ),
    R.compose(
      R.map(makeBorder),
      R.filter((t) => t.cross === "top"),
    ),
    R.compose(
      R.map(makeTrack),
      R.filter((t) => t.cross === "top"),
    ),
  ]);

  let allTracks = [
    ...R.addIndex(R.map)(
      (obt, id) => ({ ...obt, id, bgColor: `${hex.color}` }),
      hex.track || [],
    ),
    ...R.addIndex(R.map)(
      (obt, id) => ({ ...obt, id, bgColor: `${hex.color}`, type: "offboard" }),
      hex.offBoardTrack || [],
    ),
  ];
  let tracks = getTracks(allTracks);

  // Elements with an `order` leave their normal slot and are drawn after (or,
  // when negative, before) the unordered elements of their tier. Position is
  // computed over the whole list, so `order` never changes where they sit.
  const ordered = { inner: [], outside: [] };
  const slot = (tier, key, data, render, { type } = {}) => {
    const list = toList(data);
    list.forEach((e, i) => {
      if (!isOrdered(e) || e.hidden) {
        return;
      }
      const only = (x) => x === e;
      ordered[tier].push({
        order: orderValue(e),
        rank: SLOTS.indexOf(key),
        i,
        node: (
          <Fragment key={`ord-${key}-${i}`}>
            <Position data={list} type={type} pick={only}>
              {render}
            </Position>
          </Fragment>
        ),
      });
    });
    return rest(list, render, type);
  };
  const before = (tier) =>
    sortOrdered(ordered[tier].filter((o) => o.order < 0));
  const after = (tier) =>
    sortOrdered(ordered[tier].filter((o) => o.order >= 0));

  const city = (c) => <City bgColor={hex.color} {...c} />;
  const cityBorder = (c) => <City {...c} border={true} />;
  const outsideList = R.filter((c) => c.outside === true, hex.cities || []);
  const innerList = R.filter((c) => c.outside !== true, hex.cities || []);

  let outsideCities = slot("outside", "outsideCities", outsideList, city);
  let cities = slot("inner", "cities", innerList, city);
  let outsideCityBorders = borderSlot(outsideList, cityBorder);
  let cityBorders = borderSlot(innerList, cityBorder);

  const town = (t) => <Town bgColor={hex.color} {...t} />;
  const townBorder = (t) => <Town {...t} border={true} />;
  let towns = slot("inner", "towns", hex.towns, town);
  let townBorders = borderSlot(hex.towns, townBorder);

  const centerTown = (t) => <CenterTown bgColor={hex.color} {...t} />;
  const centerTownBorder = (t) => <CenterTown border={true} {...t} />;
  let centerTowns = slot("inner", "centerTowns", hex.centerTowns, centerTown);
  let centerTownBorders = borderSlot(hex.centerTowns, centerTownBorder);

  const boomtown = (t) => <Boomtown bgColor={hex.color} {...t} />;
  const boomtownBorder = (t) => <Boomtown border={true} {...t} />;
  let boomtowns = slot("inner", "boomtowns", hex.boomtowns, boomtown);
  let boomtownBorders = borderSlot(hex.boomtowns, boomtownBorder);

  const mediumCity = (m) => <MediumCity {...m} />;
  const mediumCityBorder = (m) => <MediumCity border={true} {...m} />;
  let mediumCities = slot(
    "inner",
    "mediumCities",
    hex.mediumCities,
    mediumCity,
  );
  let mediumCityBorders = borderSlot(hex.mediumCities, mediumCityBorder);

  let labels = slot(
    "inner",
    "labels",
    hex.labels,
    (l) => <Label bgColor={hex.color} {...l} />,
    { type: "label" },
  );
  let icons = slot("inner", "icons", hex.icons, (i) => <Icon {...i} />, {
    type: "icon",
  });
  let names = slot("outside", "names", hex.names, (n) => (
    <Name bgColor={hex.color} {...n} />
  ));

  // Deprecating stuff... let's convert old mountain and water to new format
  let terrainHexes = [...(hex.terrain || [])];
  if (hex.mountain) {
    if (R.is(Array, hex.mountain)) {
      terrainHexes.push(
        ...R.map((m) => ({ ...m, type: "mountain" }), hex.mountain),
      );
    } else {
      terrainHexes.push({ ...hex.mountain, type: "mountain" });
    }
  }
  if (hex.water) {
    if (R.is(Array, hex.water)) {
      terrainHexes = terrainHexes.concat(
        R.map((m) => ({ ...m, type: "water" }), hex.water),
      );
    } else {
      terrainHexes.push({ ...hex.water, type: "water" });
    }
  }
  const shapeList = hex.shapes || [];
  let bgShapes = slot(
    "inner",
    "bgShapes",
    R.filter((s) => s.background, shapeList),
    (s) => <Shape {...s} />,
  );
  let shapes = slot(
    "outside",
    "shapes",
    R.reject((s) => s.background, shapeList),
    (s) => <Shape {...s} />,
  );
  let terrain = slot(
    "inner",
    "terrain",
    terrainHexes,
    (t) => <Terrain {...t} />,
    { type: "terrain" },
  );
  let bridges = slot("outside", "bridges", hex.bridges, (b) => (
    <Bridge {...b} />
  ));
  let tunnels = slot("outside", "tunnels", hex.tunnels, (t) => (
    <Tunnel {...t} />
  ));
  const tunnelEntrance = (t) => <TunnelEntrance {...t} />;
  const tunnelEntranceBorder = (t) => <TunnelEntrance {...t} border={true} />;
  let tunnelEntranceBorders = borderSlot(
    hex.tunnelEntrances,
    tunnelEntranceBorder,
  );
  let tunnelEntrances = slot(
    "inner",
    "tunnelEntrances",
    hex.tunnelEntrances,
    tunnelEntrance,
  );
  let divides = <Position data={hex.divides}>{() => <Divide />}</Position>;

  let offBoardRevenue = slot(
    "outside",
    "offBoardRevenue",
    hex.offBoardRevenue,
    (r) => <OffBoardRevenue {...r} />,
  );

  let borders = (
    <Position data={hex.borders}>{(b) => <Border {...b} />}</Position>
  );
  let values = slot("inner", "values", hex.values, (v) => <Value {...v} />, {
    type: "value",
  });
  let industries = slot("outside", "industries", hex.industries, (i) => (
    <Industry {...i} />
  ));
  let goods = slot("inner", "goods", hex.goods, (g) => <Good {...g} />);
  let companies = slot(
    "outside",
    "companies",
    tileCompanies ? hex.companies : undefined,
    (c) => <Company {...c} />,
  );
  let bonus = slot(
    "outside",
    "bonus",
    hex.routeBonuses || hex.routeBonus,
    (b) => <RouteBonus {...b} />,
  );
  let tokens = slot(
    "inner",
    "tokens",
    tileCompanies
      ? hex.tokens
      : R.reject((t) => t.company, [].concat(hex.tokens || [])),
    (t) => (
      <ColorContext.Provider value="companies">
        {t.company ? (
          <GameMapCompanyToken {...t} abbrev={t.company} />
        ) : (
          <Token {...t} />
        )}
      </ColorContext.Provider>
    ),
  );

  // A removed border leaves a gap between the clipped fills of two hexes, so
  // clip that side to the true edge plus overlap instead. A half is clipped the
  // same way. A clipPath of the caller wins over both, so a hex that gets one is
  // drawn whole
  const halves = [hex.half, ...(extraHalves || [])].filter(Boolean);
  const seamClip =
    !clipPath && (hex.removeBorders?.length > 0 || halves.length > 0);
  const clipId = seamClip ? `hexSeamClip${seamId.replace(/:/g, "")}` : clipPath;

  return (
    <g>
      {seamClip && (
        <clipPath id={clipId}>
          <polygon points={hexClip(hex.removeBorders, halves, rotation)} />
        </clipPath>
      )}
      <PhaseContext.Provider value={hex.color || "plain"}>
        <HexContext.Provider value={hex}>
          <g
            clipPath={`url(#${clipId || "hexClipPath"})`}
            transform={`rotate(${rotation || 0})`}
          >
            <Hex
              color={hex.color || "plain"}
              stripeRotation={hex.stripeRotation}
              transparent={transparent}
              map={map}
              opacity={opacity}
            />

            <g transform={`rotate(-${rotation})`}>
              {before("inner")}
              {bgShapes}
              {goods}
              {tunnelEntranceBorders}
              {cityBorders}
              {mediumCityBorders}
              {townBorders}
              {tracks}
              {tunnelEntrances}
              {cities}
              {mediumCities}
              {towns}
              {boomtownBorders}
              {boomtowns}
              {centerTownBorders}
              {centerTowns}
              {values}
              {labels}
              {tokens}
              {terrain}
              {icons}
              {divides}
              {borders}
              {after("inner")}
            </g>
          </g>

          <HexBorder
            removeBorders={hex.removeBorders}
            border={border}
            map={map}
            halves={clipPath ? [] : halves}
          />
          {outsideCityBorders}

          {id && (
            <Id
              id={idBase}
              extra={idExtra}
              bgColor={hex.color}
              displayID={hex.displayID}
              noID={hex.noID}
            />
          )}

          {before("outside")}
          {outsideCities}
          {bonus}
          {industries}
          {companies}
          {names}
          {shapes}
          {tunnels}
          {bridges}
          {offBoardRevenue}
          {after("outside")}
        </HexContext.Provider>
      </PhaseContext.Provider>
    </g>
  );
};

export default memo(HexTile);
