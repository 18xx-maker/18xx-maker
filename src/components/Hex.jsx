import { memo } from "react";

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

const concat = R.unapply(R.reduce(R.concat, []));

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

const HexTile = ({ hex, id, clipPath, border, transparent, map, opacity }) => {
  const rotation = useOrientation();

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

  let outsideCities = (
    <Position data={R.filter((c) => c.outside === true, hex.cities || [])}>
      {(c) => <City bgColor={hex.color} {...c} />}
    </Position>
  );
  let cities = (
    <Position data={R.filter((c) => c.outside !== true, hex.cities || [])}>
      {(c) => <City bgColor={hex.color} {...c} />}
    </Position>
  );

  let outsideCityBorders = (
    <Position data={R.filter((c) => c.outside === true, hex.cities || [])}>
      {(c) => <City {...c} border={true} />}
    </Position>
  );
  let cityBorders = (
    <Position data={R.filter((c) => c.outside !== true, hex.cities || [])}>
      {(c) => <City {...c} border={true} />}
    </Position>
  );

  let towns = (
    <Position data={hex.towns}>
      {(t) => <Town bgColor={hex.color} {...t} />}
    </Position>
  );
  let townBorders = (
    <Position data={hex.towns}>{(t) => <Town {...t} border={true} />}</Position>
  );

  let centerTowns = (
    <Position data={hex.centerTowns}>
      {(t) => <CenterTown bgColor={hex.color} {...t} />}
    </Position>
  );
  let centerTownBorders = (
    <Position data={hex.centerTowns}>
      {(t) => <CenterTown border={true} {...t} />}
    </Position>
  );

  let boomtowns = (
    <Position data={hex.boomtowns}>
      {(t) => <Boomtown bgColor={hex.color} {...t} />}
    </Position>
  );
  let boomtownBorders = (
    <Position data={hex.boomtowns}>
      {(t) => <Boomtown border={true} {...t} />}
    </Position>
  );

  let mediumCities = (
    <Position data={hex.mediumCities}>{(m) => <MediumCity {...m} />}</Position>
  );
  let mediumCityBorders = (
    <Position data={hex.mediumCities}>
      {(m) => <MediumCity border={true} {...m} />}
    </Position>
  );

  let labels = (
    <Position data={hex.labels} type="label">
      {(l) => <Label bgColor={hex.color} {...l} />}
    </Position>
  );
  let icons = (
    <Position data={hex.icons} type="icon">
      {(i) => <Icon {...i} />}
    </Position>
  );
  let names = (
    <Position data={hex.names}>
      {(n) => <Name bgColor={hex.color} {...n} />}
    </Position>
  );

  // Deprecating stuff... let's convert old mountain and water to new format
  let terrainHexes = [...(hex.terrain || [])];
  if (hex.mountain) {
    if (R.is(Array, hex.mountain)) {
      terrainHexes.concat(
        R.map((m) => ({ ...m, type: "mountain" }), hex.mountain),
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
  let bgShapes = (
    <Position data={R.filter((s) => s.background, hex.shapes || [])}>
      {(s) => <Shape {...s} />}
    </Position>
  );
  let shapes = (
    <Position data={R.reject((s) => s.background, hex.shapes || [])}>
      {(s) => <Shape {...s} />}
    </Position>
  );
  let terrain = (
    <Position data={terrainHexes} type="terrain">
      {(t) => <Terrain {...t} />}
    </Position>
  );
  let bridges = (
    <Position data={hex.bridges}>{(b) => <Bridge {...b} />}</Position>
  );
  let tunnels = (
    <Position data={hex.tunnels}>{(t) => <Tunnel {...t} />}</Position>
  );
  let tunnelEntranceBorders = (
    <Position data={hex.tunnelEntrances}>
      {(t) => <TunnelEntrance {...t} border={true} />}
    </Position>
  );
  let tunnelEntrances = (
    <Position data={hex.tunnelEntrances}>
      {(t) => <TunnelEntrance {...t} />}
    </Position>
  );
  let divides = <Position data={hex.divides}>{() => <Divide />}</Position>;

  let offBoardRevenue = (
    <Position data={hex.offBoardRevenue}>
      {(r) => <OffBoardRevenue {...r} />}
    </Position>
  );

  let borders = (
    <Position data={hex.borders}>{(b) => <Border {...b} />}</Position>
  );
  let values = (
    <Position data={hex.values} type="value">
      {(v) => <Value {...v} />}
    </Position>
  );
  let industries = (
    <Position data={hex.industries}>{(i) => <Industry {...i} />}</Position>
  );
  let goods = <Position data={hex.goods}>{(g) => <Good {...g} />}</Position>;
  let companies = (
    <Position data={hex.companies}>{(c) => <Company {...c} />}</Position>
  );
  let bonus = (
    <Position data={hex.routeBonuses || hex.routeBonus}>
      {(b) => <RouteBonus {...b} />}
    </Position>
  );
  let tokens = (
    <ColorContext.Provider value="companies">
      <Position data={hex.tokens}>
        {(t) => {
          if (t.company) {
            return <GameMapCompanyToken {...t} abbrev={t.company} />;
          } else {
            return <Token {...t} />;
          }
        }}
      </Position>
    </ColorContext.Provider>
  );

  return (
    <g>
      <PhaseContext.Provider value={hex.color || "plain"}>
        <HexContext.Provider value={hex}>
          <g
            clipPath={`url(#${clipPath || "hexClipPath"})`}
            transform={`rotate(${rotation || 0})`}
          >
            <Hex
              color={hex.color || "plain"}
              transparent={transparent}
              map={map}
              opacity={opacity}
            />

            <g transform={`rotate(-${rotation})`}>
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
            </g>
          </g>

          <HexBorder
            removeBorders={hex.removeBorders}
            border={border}
            map={map}
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

          {outsideCities}
          {bonus}
          {industries}
          {companies}
          {names}
          {shapes}
          {tunnels}
          {bridges}
          {offBoardRevenue}
        </HexContext.Provider>
      </PhaseContext.Provider>
    </g>
  );
};

export default memo(HexTile);
