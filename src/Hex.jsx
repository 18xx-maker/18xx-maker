import React from "react";
import util from "./util";
import { colors } from "./data";
import * as R from "ramda";

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

  let cities = R.map(city => {
    let rotate = city.rotate === undefined ? 0 : city.rotate;
    let translate = `${city.x || 0} ${city.y || 0}`;
    let home = null;
    if (city.home) {
      home = <Label length={40} label={city.home} />;
    }
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <City size={city.size || 1} />
        {home}
      </g>
    );
  }, hex.cities || []);

  let cityBorders = R.map(city => {
    let rotate = city.rotate || 90;
    let translate = `${city.x || 0} ${city.y || 0}`;
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <City size={city.size || 1} border={true} />
      </g>
    );
  }, hex.cities || []);

  let towns = R.map(town => {
    let rotate = town.rotate === undefined ? 90 : town.rotate;
    return (
      <g transform={`translate(${town.x} ${town.y}) rotate(${rotate})`}>
        <Town />
      </g>
    );
  }, hex.towns || []);

  let townBorders = R.map(town => {
    let rotate = town.rotate === undefined ? 90 : town.rotate;
    return (
      <g transform={`translate(${town.x} ${town.y}) rotate(${rotate})`}>
        <Town border={true} />
      </g>
    );
  }, hex.towns || []);

  let centerTowns = R.map(town => {
    return (
      <g transform={`translate(${town.x || 0} ${town.y || 0})`}>
        <CenterTown border={true} />
        <CenterTown />
      </g>
    );
  }, hex.centerTowns || []);

  let label = null;
  if (hex.label && hex.label.label) {
    let translate = `${hex.label.x || 0} ${hex.label.y || 0}`;
    let rotate = hex.label.rotate === undefined ? 90 : hex.label.rotate;
    label = (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Label label={hex.label.label} />
      </g>
    );
  }

  let water = null;
  if (hex.water) {
    let translate = `${hex.water.x || 0} ${hex.water.y || 0}`;
    let rotate = hex.water.rotate === undefined ? 0 : hex.water.rotate;
    water = (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Water cost={hex.water.cost} size={hex.water.size} />
      </g>
    );
  }

  let mountain = null;
  if (hex.mountain) {
    let translate = `${hex.mountain.x || 0} ${hex.mountain.y || 0}`;
    let rotate = hex.mountain.rotate === undefined ? 0 : hex.mountain.rotate;
    mountain = (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Mountain cost={hex.mountain.cost} size={hex.mountain.size} />
      </g>
    );
  }

  let offBoardRevenue = null;
  if (hex.offBoardRevenue && hex.offBoardRevenue.revenues) {
    let translate = `${hex.offBoardRevenue.x || 0} ${hex.offBoardRevenue.y ||
      0}`;
    let rotate =
      hex.offBoardRevenue.rotate === undefined ? 0 : hex.offBoardRevenue.rotate;
    offBoardRevenue = (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <OffBoardRevenue revenues={hex.offBoardRevenue.revenues} />
      </g>
    );
  }

  let borders = R.map(border => {
    let rotation = (border.side - 1) * 60;
    return (
      <g transform={`rotate(${rotation})`}>
        <Border color={border.color} />
      </g>
    );
  }, hex.borders || []);

  let borderBorders = R.map(border => {
    let rotation = (border.side - 1) * 60;
    return (
      <g transform={`rotate(${rotation})`}>
        <Border border={true} color={border.color} />
      </g>
    );
  }, hex.borders || []);

  let values = R.map(value => {
    let translate = `${value.x || 0} ${value.y || 0}`;
    let rotate = value.rotate === undefined ? 90 : value.rotate;
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Value value={value.value} />
      </g>
    );
  }, hex.values || []);

  return (
    <g>
      <Hex color={hex.color} />

      {id && (
        <g transform="translate(-64 -35) rotate(90)">
          <Id id={id} />
        </g>
      )}

      {cityBorders}
      {townBorders}
      {tracks}
      {offBoardTracks}
      {values}
      {cities}
      {towns}
      {centerTowns}
      {label}
      {offBoardRevenue}
      {water}
      {mountain}
      {borderBorders}
      {borders}

      {border && <Hex border={true} />}
    </g>
  );
};

export default HexTile;
