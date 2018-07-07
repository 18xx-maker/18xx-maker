import React from "react";
import util from "./util";
import * as R from "ramda";

import Position from "./Position";

import HexContext from "./context/HexContext";

import Hex from "./atoms/Hex";
import Track from "./atoms/Track";
import Id from "./atoms/Id";
import City from "./atoms/City";
import Town from "./atoms/Town";
import CenterTown from "./atoms/CenterTown";
import Label from "./atoms/Label";
import Value from "./atoms/Value";
import OffBoardRevenue from "./atoms/OffBoardRevenue";
import OffBoardTrack from "./atoms/OffBoardTrack";
import Water from "./atoms/Water";
import Mountain from "./atoms/Mountain";
import Border from "./atoms/Border";

const concat = R.unapply(R.reduce(R.concat, []));

const makeOffBoardTrack = track => {
  let side = track.side;
  let rotation = (side - 1) * 60;
  let transform = `rotate(${rotation})`;
  return (
    <g transform={transform}>
      <OffBoardTrack border={true} />
      <OffBoardTrack />
    </g>
  );
};

const makeTrack = track => {
  let point = track.start || track.end || track.side;
  let rotation = (point - 1) * 60;
  let transform = `rotate(${rotation})`;
  return (
    <g transform={transform}>
      <Track type={track.type || util.trackType(track)} gauge={track.gauge} />
    </g>
  );
};

const makeBorder = track => {
  let point = track.start || track.end || track.side;
  let rotation = (point - 1) * 60;
  let transform = `rotate(${rotation})`;
  return (
    <g transform={transform}>
      <Track type={track.type || util.trackType(track)} border={true} />
    </g>
  );
};

const HexTile = ({ hex, id, border }) => {
  let getTracks = R.converge(concat, [
    R.compose(
      R.map(makeBorder),
      R.filter(t => t.cross !== "over")
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
      R.filter(t => t.cross !== "under")
    )
  ]);

  let tracks = getTracks(hex.track || []);

  let offBoardTracks = R.map(makeOffBoardTrack, hex.offBoardTrack || []);

  let cities = <Position data={hex.cities}>{c => <City {...c} />}</Position>;

  let cityBorders = (
    <Position data={hex.cities}>{c => <City {...c} border={true} />}</Position>
  );

  let towns = <Position data={hex.towns}>{t => <Town />}</Position>;

  let townBorders = (
    <Position data={hex.towns}>{t => <Town border={true} />}</Position>
  );

  let centerTowns = (
    <Position data={hex.centerTowns}>
      {t => [<CenterTown border={true} />, <CenterTown {...t} />]}
    </Position>
  );

  let labels = <Position data={hex.labels}>{l => <Label {...l} />}</Position>;

  let water = <Position data={hex.water}>{w => <Water {...w} />}</Position>;

  let mountain = (
    <Position data={hex.mountain}>{m => <Mountain {...m} />}</Position>
  );

  let offBoardRevenue = (
    <Position data={hex.offBoardRevenue}>
      {r => <OffBoardRevenue {...r} />}
    </Position>
  );

  let borders = (
    <Position data={hex.borders}>{b => <Border {...b} />}</Position>
  );

  let borderBorders = (
    <Position data={hex.borders}>
      {b => <Border {...b} border={true} />}
    </Position>
  );

  let values = <Position data={hex.values}>{v => <Value {...v} />}</Position>;

  return (
    <g>
      <Hex color={hex.color} />

      {cityBorders}
      {townBorders}
      {tracks}
      {offBoardTracks}
      {values}
      {cities}
      {towns}
      {centerTowns}
      {labels}
      {offBoardRevenue}
      {water}
      {mountain}
      {borderBorders}
      {borders}

      {id && (
        <HexContext.Consumer>
          {hc => (
            <g transform={`translate(-70 -40) rotate(${hc.rotation})`}>
              <Id id={id} />
            </g>
          )}
        </HexContext.Consumer>
      )}

      {border && <Hex border={true} />}
    </g>
  );
};

export default HexTile;
