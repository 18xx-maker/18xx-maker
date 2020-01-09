import { HEX_RATIO } from "../map/util";

export const getTileSheetContext = (layout, paper, hexWidth) => {
  let c = { layout, paper, hexWidth };

  // Hardcode hexWidth for the layouts corresponding to dies
  switch (layout) {
  case "die":
    c.hexWidth = 150;
    break;
  case "smallDie":
    c.hexWidth = 106.25;
    break;
  default:
    break;
  }

  // Usable Height and Width on the chosen paper
  c.pageWidth = paper.width - (paper.margins * 2);
  c.pageHeight = paper.height - (paper.margins * 2);

  // The height of a tile
  c.height = c.hexWidth;
  c.bleedHeight = c.hexWidth + 20;

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
    c.perPage = c.perRow * c.rowsPerPage;
    c.pageWidth = 800;
    c.pageHeight = 1050;
    c.mask = "hexBleedMask";

    // The die spaces columns apart by 0.25 inches
    c.tileOffsetX = (c.width + 25);
    c.tileOffsetY = c.height;

    // Functions to help find tile locations
    c.getXindex = n => Math.floor(n / c.rowsPerPage)
    c.getYindex = n => n % c.rowsPerPage;

    // Extra space around the page
    c.extraX = (c.pageWidth - (c.perRow * c.width) - ((c.perRow - 1) * 25)) / 2;
    c.extraY = 25 + 37.5; // Half inch above the pins, rest below

    // Functions to get coordinates
    c.getX = n => (c.width / 2) + c.extraX + (c.getXindex(n) * c.tileOffsetX);
    c.getY = n => (c.height / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY);
    break;
  case "smallDie":
    c.perRow = 7;
    c.rowsPerPage = 9;
    c.perPage = 60;
    c.pageWidth = 800;
    c.pageHeight = 1050;
    c.mask = "hexBleedMask";

    // The die spaces columns apart by -0.0994 inches
    c.tileOffsetX = (c.width - 9.94);
    c.tileOffsetY = c.height;

    // Functions to help find tile locations
    c.getXindex = n => {
      let group = Math.floor(n / 17)
      let index = n % 17

      return (group * 2) + (index > 8 ? 1 : 0)
    }

    c.getYindex = n => {
      let index = n % 17

      return index > 8 ? index - 9 : index
    }

    // Extra space around the page
    c.extraX = (c.pageWidth - (5.5 * c.width) - (20.73 * 6)) / 2;
    c.extraY = 25 + 37.5; // Half inch above the pins, rest below

    // Functions to get coordinates
    c.getX = n => (c.width / 2) + c.extraX + (c.getXindex(n) * c.tileOffsetX);
    c.getY = n => {
      let xIndex = c.getXindex(n)

      if (xIndex % 2 === 0) {
        return (c.height / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY);
      } else {
        return (c.height / 2) + c.extraY + (c.getYindex(n) * c.tileOffsetY) + (0.5 * c.height);
      }
    }
    break;
  case "individual":
    c.perRow = Math.floor((c.pageWidth + 12.5) / (c.width + 12.5));
    c.rowsPerPage = Math.floor((c.pageHeight + 12.5) / (c.height + 12.5));
    c.perPage = c.perRow * c.rowsPerPage;
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
    c.perPage = c.perRow * c.rowsPerPage;
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

  return c;
};
