import { HEX_RATIO } from "../map/util";

export const getTileSheetContext = (layout, paper, hexWidth) => {
  let c = { layout, paper, hexWidth };

  // Usable Height and Width on the chosen paper
  c.pageWidth = paper.width - (paper.margins * 2);
  c.pageHeight = paper.height - (paper.margins * 2);

  // The height of a tile
  c.height = hexWidth;
  c.bleedHeight = hexWidth + 20;

  // The width of a tile
  c.width = c.height * HEX_RATIO * 2;
  c.bleedWidth = c.bleedHeight * HEX_RATIO * 2;

  // How many tiles per row
  c.perRow = 4;
  c.rowsPerPage = 6;

  // Functions to help find tile locations
  c.getXindex = n => n % c.perRow;
  c.getYindex = n => Math.floor(n / c.perRow);
  c.isOdd = n => c.getYindex(n) % 2 !== 0;

  // Layout specific values
  switch (layout) {
  case "die":
    c.perRow = 4;
    c.rowsPerPage = 6;
    c.pageWidth = 800;
    c.pageHeight = 1050;
    c.mask = "hexBleedMask";

    // The die spaces columns apart by 0.25 inches
    c.tileOffsetX = (c.width + 25);
    c.tileOffsetY = c.height;

    // Extra space around the page
    c.extraX = (c.pageWidth - (c.perRow * c.width) - ((c.perRow - 1) * 25)) / 2;
    c.extraY = 25 + 37.5; // Half inch above the pins, rest below

    // Functions to get coordinates
    c.getX = n => (c.width / 2) + c.extraX + (c.getXindex(n) * c.tileOffsetX);
    c.getY = n => (c.height / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY);
    break;
  case "individual":
    c.perRow = Math.floor((c.pageWidth + 12.5) / (c.width + 12.5));
    c.rowsPerPage = Math.floor((c.pageHeight + 12.5) / (c.height + 12.5));
    c.mask = "hexMask";

    c.gapX = 12.5;
    c.gapY = 12.5;

    c.tileOffsetX = c.width + 12.5;
    c.tileOffsetY = c.height + 12.5;

    // Extra space around the page
    c.extraX = (c.pageWidth - (c.perRow * c.width) - ((c.perRow - 1) * c.gapX)) / 2;
    c.extraY = (c.pageHeight - (c.rowsPerPage * c.height) - ((c.rowsPerPage - 1) * c.gapY)) / 2;

    // Functions to get coordinates
    c.getX = n => (c.bleedWidth / 2) + c.extraX + (c.getXindex(n) * c.tileOffsetX);
    c.getY = n => (c.height / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY);
    break;
  case "offset":
    c.perRow = Math.floor((c.pageWidth - 20 - (c.width / 2)) / c.width);
    c.rowsPerPage = Math.floor((c.pageHeight - 20) / c.height);
    c.mask = "hexBleedMaskOffset";

    // Offset tiles are always offset by their plain width and height, regardless of bleed
    c.tileOffsetX = c.width;
    c.tileOffsetY = c.height;

    // Extra space around the page
    c.extraX = (c.pageWidth - (c.perRow * c.width) - (c.width / 2) - 20) / 2;
    c.extraY = (c.pageHeight - (c.rowsPerPage * c.height) - 20) / 2;

    // Functions to get coordinates
    c.getX = n => {
      if (c.isOdd(n)) {
        return (c.bleedWidth / 2) + c.extraX + (c.width / 2) + (c.getXindex(n) * c.tileOffsetX);
      } else {
        return (c.bleedWidth / 2) + c.extraX + (c.getXindex(n) * c.tileOffsetX);
      }
    };
    c.getY = n => (c.bleedHeight / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY);
    break;
  default:
    break;
  }

  // Calculate how many tiles per page from the other values
  c.perPage = c.perRow * c.rowsPerPage;

  return c;
};
