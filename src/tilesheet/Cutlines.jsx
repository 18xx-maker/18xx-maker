import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import curry from "ramda/src/curry";
import map from "ramda/src/map";
import range from "ramda/src/range";

import { getTileSheetContext } from "./util";

const STROKE = {
  stroke: "gray",
  strokeDasharray: "4 2",
  strokeWidth: "1"
};

const getLineX = curry((slope, x1, y1, y2) => {
  return ((y2 - y1) / slope) + x1;
});

const HorizontalLines = ({ getY, perRow, pageWidth, width, height, extraY, rowsPerPage, tileOffsetY }) => {
  let indexes = range(0,rowsPerPage + 1);
  let y = index => getY(index * perRow) - (height / 2);

  return map(index => <line key={`horizontal-${index}`}
                      x1={0}
                      y1={y(index)}
                      x2={pageWidth}
                      y2={y(index)}
                      {...STROKE} />, indexes);
};

const ForwardLines = ({ perPage, getX, getY, height, width, extraX, extraY, pageHeight, perRow, rowsPerPage }) => {
  let indexes = range(0, 2 * perPage);

  let x = i => getLineX(-1.732051615,
                       getX(Math.floor(i / 2)) + ((i % 2 === 0 ? -width : width) / 2),
                       getY(Math.floor(i / 2)));

  return map(index => <line key={`forward-${index}`}
                      x1={x(index)(0)}
                      y1={0}
                      x2={x(index)(pageHeight)}
                      y2={pageHeight}
                      {...STROKE} />, indexes);
};

const BackwardLines = ({ getX, getY, pageHeight, height, width, extraX, extraY, perPage, perRow, rowsPerPage }) => {
  let indexes = range(0, 2 * perPage);

  let x = i => getLineX(1.732051615,
                       getX(Math.floor(i / 2)) + ((i % 2 === 0 ? -width : width) / 2),
                       getY(Math.floor(i / 2)));

  return map(index => <line key={`forward-${index}`}
                      x1={x(index)(0)}
                      y1={0}
                      x2={x(index)(pageHeight)}
                      y2={pageHeight}
                      {...STROKE} />, indexes);
};

const Cutlines = () => {
  const { config } = useContext(ConfigContext);
  const hexWidth = config.tiles.width;
  const layout = config.tiles.layout;
  const paper = config.paper;

  if (layout !== "offset") {
    return null;
  }

  let c = getTileSheetContext(layout, paper, hexWidth);
  return [
    <HorizontalLines key="horizontal" {...c} />,
    <ForwardLines key="forward" {...c} />,
    <BackwardLines key="backward" {...c} />
  ];
};

export default Cutlines;
