import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useMatch } from "react-router";

import ExportIcon from "@mui/icons-material/Collections";
import PngIcon from "@mui/icons-material/PhotoLibrary";
import PdfIcon from "@mui/icons-material/PictureAsPdf";
import Divider from "@mui/material/Divider";
import Fab from "@mui/material/Fab";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";
import makeStyles from "@mui/styles/makeStyles";

import { assoc, flatten, forEach, is, keys, map, range } from "ramda";

import { useConfig, useGame } from "@/hooks";
import schema from "@/schemas/config.schema.json";
import { maxPlayers, titleToFilename } from "@/util";
import { trackEvent } from "@/util/analytics";
import { compileCompanies, overrideCompanies } from "@/util/companies";
import { useBooleanParam } from "@/util/query";

const useStyles = makeStyles((theme) => ({
  exportButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: "fixed",
    bottom: theme.spacing(14),
    right: theme.spacing(4),
  },
}));

const pngItems = (game, config) => {
  const filename = titleToFilename(game.info.title);
  let items = {
    background: `${filename}-background.png`,
    revenue: `${filename}-revenue.png`,
  };

  // Number Cards
  forEach(
    (n) => {
      items[`cards/number/${n}`] = `${filename}-card-number-${n}.png`;
    },
    range(1, maxPlayers(game.players || []) + 1),
  );

  // Privates
  for (let i = 0; i < (game.privates || []).length; i++) {
    items[`cards/private/${i}`] = `${filename}-card-private-${i + 1}.png`;
  }

  // Trains
  for (let i = 0; i < (game.trains || []).length; i++) {
    items[`cards/train/${i}`] =
      `${filename}-card-train-${i + 1}-${game.trains[i].name.replace(" ", "_")}.png`;
  }

  // Shares
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  let companies =
    overrideCompanies(compileCompanies(game), override, selection) || [];
  let shares = flatten(
    map((c) => map((s) => assoc("company", c, s), c.shares || []), companies),
  );
  for (let i = 0; i < shares.length; i++) {
    items[`cards/share/${i}`] =
      `${filename}-card-share-${i + 1}-${shares[i].company.abbrev}.png`;
  }

  for (let i = 0; i < companies.length; i++) {
    items[`charters/${i}`] =
      `${filename}-charter-${i + 1}-${companies[i].abbrev}.png`;
  }

  for (let i = 0; i < companies.length; i++) {
    items[`tokens/${i}`] =
      `${filename}-token-${i + 1}-${companies[i].abbrev}.png`;
  }

  for (let i = 0; i < (game.tokens || []).length; i++) {
    items[`tokens/${i + companies.length}`] =
      `${filename}-token-${i + 1 + companies.length}.png`;
  }

  if (game.map) {
    if (is(Array, game.map)) {
      for (let i = 0; i < game.map.length; i++) {
        items[`map?variation=${i}`] = `${filename}-map-${i}.png`;
      }
    } else {
      items["map"] = `${filename}-map.png`;
    }
  }

  if (game.stock) {
    if (game.stock.market) {
      items["market"] = `${filename}-market.png`;
    }

    if (game.stock.par && game.stock.par.values) {
      items["par"] = `${filename}-par.png`;
    }
  }

  if (game.tiles) {
    items["tile-manifest"] = `${filename}-tile-manifest.png`;

    forEach((id) => {
      items[`tiles/${id}`] = `${filename}-tile-${id}.png`;
    }, keys(game.tiles));
  }

  return items;
};

const pdfItems = (game, config) => {
  const filename = titleToFilename(game.info.title);
  let items = {
    background: `${filename}-background.pdf`,
    revenue: `${filename}-revenue.pdf`,
    "revenue?paginated=true": `${filename}-revenue-paginated.pdf`,
  };

  if (config.export.allLayouts) {
    forEach((layout) => {
      items[`cards?config.cards.layout=${layout}`] =
        `${filename}-cards-${layout}.pdf`;
    }, schema.properties.cards.properties.layout.enum);
  } else {
    items["cards"] = `${filename}-cards.pdf`;
  }

  if (game.companies || game.tokens) {
    if (config.export.allLayouts) {
      forEach((layout) => {
        items[`tokens?config.tokens.layout=${layout}`] =
          `${filename}-tokens-${layout}.pdf`;
      }, schema.properties.tokens.properties.layout.enum);
    } else {
      items["tokens"] = `${filename}-tokens.pdf`;
    }
  }

  if (game.companies) {
    items["charters"] = `${filename}-charters.pdf`;
  }

  if (game.map) {
    if (is(Array, game.map)) {
      for (let i = 0; i < game.map.length; i++) {
        items[`map?variation=${i}`] = `${filename}-map-${i}.pdf`;
        items[`map?paginated=true&variation=${i}`] =
          `${filename}-map-${i}-paginated.pdf`;
      }
    } else {
      items["map"] = `${filename}-map.pdf`;
      items["map?paginated=true"] = `${filename}-map-paginated.pdf`;
    }
  }

  if (game.stock) {
    if (game.stock.market) {
      items["market"] = `${filename}-market.pdf`;
      items["market?paginated=true"] = `${filename}-market-paginated.pdf`;
    }

    if (game.stock.par && game.stock.par.values) {
      items["par"] = `${filename}-par.pdf`;
      items["par?paginated=true"] = `${filename}-par-paginated.pdf`;
    }
  }

  if (game.tiles) {
    items["tile-manifest"] = `${filename}-tile-manifest.pdf`;

    if (config.export.allLayouts) {
      forEach((layout) => {
        items[`tiles?config.tiles.layout=${layout}`] =
          `${filename}-tiles-${layout}.pdf`;
      }, schema.properties.tiles.properties.layout.enum);
    } else {
      items["tiles"] = `${filename}-tiles.pdf`;
    }
  }

  return items;
};

const ExportButton = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const game = useGame();
  const { config } = useConfig();
  const [print] = useBooleanParam("print");
  const [menuAnchor, setMenuAnchor] = useState(null);

  const match = useMatch("/games/:slug/*");
  const notOnGames = !match || match.params["*"] === "";

  if (notOnGames || print || !game) {
    return null;
  }

  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAllPdf = () => {
    trackEvent("exportGame", location, { media: "pdf" });
    window.api.exportPDF(game.meta.slug, pdfItems(game, config));
    handleMenuClose();
  };

  const handleAllPng = () => {
    trackEvent("exportGame", location, { media: "png" });
    window.api.exportPNG(game.meta.slug, pngItems(game, config));
    handleMenuClose();
  };

  const handleSinglePdf = () => {
    trackEvent("exportComponent", location, { media: "pdf" });
    window.api.pdf(location.pathname + location.search);
    handleMenuClose();
  };

  const handleSinglePng = () => {
    trackEvent("exportComponent", location, { media: "png" });
    window.api.png(location.pathname + location.search);
    handleMenuClose();
  };

  return (
    <>
      <Slide direction="left" in={true}>
        <Tooltip title="Export" aria-label="export" placement="left" arrow>
          <Fab
            onClick={handleMenu}
            position="sticky"
            className={classes.exportButton}
            color="primary"
          >
            <ExportIcon />
          </Fab>
        </Tooltip>
      </Slide>
      <Menu
        id="export-menu"
        anchorEl={menuAnchor}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleMenuClose}
        open={Boolean(menuAnchor)}
        keepMounted
      >
        <MenuItem onClick={handleAllPdf}>
          <ListItemIcon>
            <PdfIcon />
          </ListItemIcon>
          <ListItemText primary={t("export.allPdf")} />
        </MenuItem>
        <MenuItem onClick={handleAllPng}>
          <ListItemIcon>
            <PngIcon />
          </ListItemIcon>
          <ListItemText primary={t("export.allPng")} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSinglePdf}>
          <ListItemIcon>
            <PdfIcon />
          </ListItemIcon>
          <ListItemText primary={t("export.singlePdf")} />
        </MenuItem>
        <MenuItem onClick={handleSinglePng}>
          <ListItemIcon>
            <PngIcon />
          </ListItemIcon>
          <ListItemText primary={t("export.singlePng")} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportButton;
