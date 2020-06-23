import React from "react";
import * as R from "ramda";
import hash from "object-hash";

import Position from "./Position";

import PhaseContext from "./context/PhaseContext";
import ColorContext from "./context/ColorContext";
import { useOrientation } from "./context/OrientationContext";

import Border from "./atoms/Border";
import Bridge from "./atoms/Bridge";
import CenterTown from "./atoms/CenterTown";
import Boomtown from "./atoms/Boomtown";
import City from "./atoms/City";
import Company from "./atoms/Company";
import Divide from "./atoms/Divide";
import Good from "./atoms/Good";
import Hex from "./atoms/Hex";
import HexBorder from "./atoms/HexBorder";
import Icon from "./atoms/Icon";
import Id from "./atoms/Id";
import Industry from "./atoms/Industry";
import Label from "./atoms/Label";
import MediumCity from "./atoms/MediumCity";
import Name from "./atoms/Name";
import OffBoardRevenue from "./atoms/OffBoardRevenue";
import RouteBonus from "./atoms/RouteBonus";
import Terrain from "./atoms/Terrain";
import Town from "./atoms/Town";
import Track from "./atoms/Track";
import Tunnel from "./atoms/Tunnel";
import TunnelEntrance from "./atoms/TunnelEntrance";
import Value from "./atoms/Value";

import Shape from "./atoms/shapes/Shape";

import GameMapCompanyToken from "./tokens/GameMapCompanyToken";
import Token from "./tokens/Token";

const concat = R.unapply(R.reduce(R.concat, []));

const makeTrack = track => (
  <Position key={`track-${hash(track)}`} data={track}>
    {t => <Track {...t} />}
  </Position>
);
const makeBorder = track => (
  <Position key={`track-border-${hash(track)}`} data={track}>
    {t => <Track {...t} border={true} />}
  </Position>
);

const HexTile = ({ hex, id, mask, border, transparent, map }) => {
  const rotation = useOrientation();

  if (hex === undefined || hex === null) {
    return null;
  }

  let [idBase, idExtra] = (id || "").split("|");

  let getTracks = R.converge(concat, [
    R.compose(
      R.map(makeBorder),
      R.filter(t => t.cross === "bottom")
    ),
    R.compose(
      R.map(makeTrack),
      R.filter(t => t.cross === "bottom")
    ),
    R.compose(
      R.map(makeBorder),
      R.filter(t => (t.cross === undefined || t.cross === "under"))
    ),
    R.compose(
      R.map(makeTrack),
      R.filter(t => t.cross === "under")
    ),
    R.compose(
      R.map(makeBorder),
      R.filter(t => t.cross === "over")
    ),
    R.compose(
      R.map(makeTrack),
      R.filter(t => (t.cross === undefined || t.cross === "over"))
    ),
    R.compose(
      R.map(makeBorder),
      R.filter(t => t.cross === "top")
    ),
    R.compose(
      R.map(makeTrack),
      R.filter(t => t.cross === "top")
    )
  ]);

  let allTracks = [
    ...(hex.track || []),
    ...R.map(obt => ({ ...obt, type: "offboard" }), hex.offBoardTrack || [])
  ];
  let tracks = getTracks(allTracks);

  let outsideCities = (
    <Position data={R.filter(c => c.outside === true, hex.cities || [])}>
      {c => <City bgColor={hex.color} {...c} />}
    </Position>
  );
  let cities = (
    <Position data={R.filter(c => c.outside !== true, hex.cities || [])}>
      {c => <City bgColor={hex.color} {...c} />}
    </Position>
  );

  let outsideCityBorders = (
    <Position data={R.filter(c => c.outside === true, hex.cities || [])}>
      {c => <City {...c} border={true} />}
    </Position>
  );
  let cityBorders = (
    <Position data={R.filter(c => c.outside !== true, hex.cities || [])}>
      {c => <City {...c} border={true} />}
    </Position>
  );

  let towns = (
    <Position data={hex.towns}>
      {t => <Town bgColor={hex.color} {...t} />}
    </Position>
  );
  let townBorders = (
    <Position data={hex.towns}>{t => <Town {...t} border={true} />}</Position>
  );

  let centerTowns = (
    <Position data={hex.centerTowns}>
      {t => <CenterTown bgColor={hex.color} {...t} />}
    </Position>
  );
  let centerTownBorders = (
    <Position data={hex.centerTowns}>
      {t => <CenterTown border={true} {...t} />}
    </Position>
  );

  let boomtowns = (
    <Position data={hex.boomtowns}>
      {t => <Boomtown bgColor={hex.color} {...t} />}
    </Position>
  );
  let boomtownBorders = (
    <Position data={hex.boomtowns}>
      {t => <Boomtown border={true} {...t} />}
    </Position>
  );

  let mediumCities = (
    <Position data={hex.mediumCities}>{m => <MediumCity {...m} />}</Position>
  );
  let mediumCityBorders = (
    <Position data={hex.mediumCities}>
      {m => <MediumCity border={true} {...m} />}
    </Position>
  );

  let labels = (
    <Position data={hex.labels}>
      {l => <Label bgColor={hex.color} {...l} />}
    </Position>
  );
  let icons = <Position data={hex.icons}>{i => <Icon {...i} />}</Position>;
  let names = (
    <Position data={hex.names}>
      {n => <Name bgColor={hex.color} {...n} />}
    </Position>
  );

  // Deprecating stuff... let's convert old mountain and water to new format
  let terrainHexes = [...(hex.terrain || [])];
  if (hex.mountain) {
    if (R.is(Array, hex.mountain)) {
      terrainHexes.concat(
        R.map(m => ({ ...m, type: "mountain" }), hex.mountain)
      );
    } else {
      terrainHexes.push({ ...hex.mountain, type: "mountain" });
    }
  }
  if (hex.water) {
    if (R.is(Array, hex.water)) {
      terrainHexes = terrainHexes.concat(
        R.map(m => ({ ...m, type: "water" }), hex.water)
      );
    } else {
      terrainHexes.push({ ...hex.water, type: "water" });
    }
  }
  let bgShapes = <Position data={R.filter(s => s.background, hex.shapes || [])}>{s => <Shape {...s}/>}</Position>;
  let shapes = <Position data={R.reject(s => s.background, hex.shapes || [])}>{s => <Shape {...s}/>}</Position>;
  let terrain = (
    <Position data={terrainHexes}>{t => <Terrain {...t} />}</Position>
  );
  let bridges = (
    <Position data={hex.bridges}>{b => <Bridge {...b} />}</Position>
  );
  let tunnels = (
    <Position data={hex.tunnels}>{t => <Tunnel {...t} />}</Position>
  );
  let tunnelEntranceBorders = (
    <Position data={hex.tunnelEntrances}>{t => <TunnelEntrance {...t} border={true} />}</Position>
  );
  let tunnelEntrances = (
    <Position data={hex.tunnelEntrances}>{t => <TunnelEntrance {...t} />}</Position>
  );
  let divides = <Position data={hex.divides}>{t => <Divide />}</Position>;

  let offBoardRevenue = (
    <Position data={hex.offBoardRevenue}>
      {r => <OffBoardRevenue {...r} />}
    </Position>
  );

  let borders = (
    <Position data={hex.borders}>{b => <Border {...b} />}</Position>
  );
  let values = <Position data={hex.values}>{v => <Value {...v} />}</Position>;
  let industries = (
    <Position data={hex.industries}>{i => <Industry {...i} />}</Position>
  );
  let goods = <Position data={hex.goods}>{g => <Good {...g} />}</Position>;
  let companies = (
    <Position data={hex.companies}>{c => <Company {...c} />}</Position>
  );
  let bonus = (
    <Position data={hex.routeBonus}>{b => <RouteBonus {...b} />}</Position>
  );
  let tokens = (
    <ColorContext.Provider value="companies">
      <Position data={hex.tokens}>
        {t => {
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
        <g
          mask={`url(#${mask || "hexMask"})`}
          transform={`rotate(${rotation || 0})`}
        >
          <Hex
            color={hex.color || "plain"}
            transparent={transparent}
            map={map}
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

        {id && <Id id={idBase} extra={idExtra} />}

        {outsideCities}
        {bonus}
        {industries}
        {companies}
        {names}
        {shapes}
        {tunnels}
        {bridges}
        {offBoardRevenue}
      </PhaseContext.Provider>
    </g>
  );
};

export default HexTile;
