import { curry, map, range } from "ramda";

import { useConfig } from "@/hooks";
import { layoutPaper } from "@/util";
import { getTileSheetContext } from "@/util/tiles/tilesheet";

const STROKE = {
  stroke: "gray",
  strokeDasharray: "4 2",
  strokeWidth: "1",
};

const getLineX = curry((slope, x1, y1, y2) => {
  return (y2 - y1) / slope + x1;
});

const HorizontalLines = ({ getY, perRow, pageWidth, height, rowsPerPage }) => {
  let indexes = range(0, rowsPerPage + 1);
  let y = (index) => getY(index * perRow) - height / 2;

  return map(
    (index) => (
      <line
        key={`horizontal-${index}`}
        x1={0}
        y1={y(index)}
        x2={pageWidth}
        y2={y(index)}
        {...STROKE}
      />
    ),
    indexes,
  );
};

const DiagonalLines = ({
  slope,
  name,
  perPage,
  getX,
  getY,
  width,
  pageHeight,
}) => {
  let indexes = range(0, 2 * perPage);

  let x = (i) =>
    getLineX(
      slope,
      getX(Math.floor(i / 2)) + (i % 2 === 0 ? -width : width) / 2,
      getY(Math.floor(i / 2)),
    );

  return map(
    (index) => (
      <line
        key={`${name}-${index}`}
        x1={x(index)(0)}
        y1={0}
        x2={x(index)(pageHeight)}
        y2={pageHeight}
        {...STROKE}
      />
    ),
    indexes,
  );
};

const Cutlines = () => {
  const { config } = useConfig();
  const hexWidth = config.tiles.width;
  const layout = config.tiles.layout;
  const paper = layoutPaper(config.paper, config.printScale);

  if (layout !== "offset") {
    return null;
  }

  let c = getTileSheetContext(layout, paper, hexWidth);
  return [
    <HorizontalLines key="horizontal" {...c} />,
    <DiagonalLines key="forward" name="forward" slope={-1.732051615} {...c} />,
    <DiagonalLines key="backward" name="backward" slope={1.732051615} {...c} />,
  ];
};

export default Cutlines;
