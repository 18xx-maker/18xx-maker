// The color of a cell of the market, a name for the theme: a par cell takes
// the color of the par chart, then a legend entry (an index that exists, a negative one
// is not), then
// the cell's own color, the color all cells start with, and last plain.
// data has the stock's cell, legend and par. c resolves a color name, the
// cell is already an object (normalizeCell).
const resolveCellColor = (cell, data, c) => {
  if (cell.par) {
    return data.par && data.par.color ? c(data.par.color) : c("gray");
  }
  if (
    Number.isInteger(cell.legend) &&
    cell.legend >= 0 &&
    cell.legend < data.legend.length
  ) {
    return c(data.legend[cell.legend].color);
  }
  if (cell.color) return c(cell.color);
  if (data.cell && data.cell.color) return c(data.cell.color);
  return c("plain");
};

export default resolveCellColor;
