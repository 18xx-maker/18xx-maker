import React from "react";
import util from "./util";
import { colors } from "./data";
import tiles from "./data/tiles";
import * as R from "ramda";

import Hex from "./atoms/Hex";
import Track from "./atoms/Track";
import Id from "./atoms/Id";
import City from "./atoms/City";
import Town from "./atoms/Town";
import Label from "./atoms/Label";
import Value from "./atoms/Value";

const concat = R.unapply(R.reduce(R.concat, []));

const Tile = ({ id, border }) => {
  let tile = tiles[id];

  let makeTrack = track => {
    let point = track.start || track.end;
    let rotation = (point - 1) * 60;
    let transform = `rotate(${rotation})`;
    return (
      <g transform={transform}>
        <Track type={util.trackType(track)} gauge={track.gauge} />
      </g>
    );
  };

  let makeBorder = track => {
    let point = track.start || track.end;
    let rotation = (point - 1) * 60;
    let transform = `rotate(${rotation})`;
    return (
      <g transform={transform}>
        <Track type={util.trackType(track)} border={true} />
      </g>
    );
  };

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

  let tracks = getTracks(tile.track || []);

  let cities = R.map(city => {
    let rotate = city.rotate || 90;
    let translate = `${city.x || 0} ${city.y || 0}`;
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <City size={city.size || 1} />
      </g>
    );
  }, tile.cities || []);

  let cityBorders = R.map(city => {
    let rotate = city.rotate || 90;
    let translate = `${city.x || 0} ${city.y || 0}`;
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <City size={city.size || 1} border={true} />
      </g>
    );
  }, tile.cities || []);

  let towns = R.map(town => {
    return (
      <g transform={`translate(${town.x} ${town.y}) rotate(${town.rotate})`}>
        <Town />
      </g>
    );
  }, tile.towns || []);

  let townBorders = R.map(town => {
    return (
      <g transform={`translate(${town.x} ${town.y}) rotate(${town.rotate})`}>
        <Town border={true} />
      </g>
    );
  }, tile.towns || []);

  let label = null;
  if (tile.label && tile.label.label) {
    let translate = `${tile.label.x || 0} ${tile.label.y || 0}`;
    let rotate = tile.label.rotate || 90;
    label = (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Label label={tile.label.label} />
      </g>
    );
  }

  let values = R.map(value => {
    let translate = `${value.x || 0} ${value.y || 0}`;
    let rotate = value.rotate || 90;
    return (
      <g transform={`translate(${translate}) rotate(${rotate})`}>
        <Value value={value.value} />
      </g>
    );
  }, tile.values || []);

  return (
    <g>
      <Hex color={tile.color} />

      <g transform="translate(-64 -35) rotate(90)">
        <Id id={id} />
      </g>

      {cityBorders}
      {townBorders}
      {tracks}
      {values}
      {cities}
      {towns}
      {label}

      {border && <Hex border={true} />}
    </g>
  );
};

export default Tile;
