import React, { useContext, useState } from "react";
import { Route, useLocation } from "react-router";
import { useTranslation } from 'react-i18next';
import GameContext from "./context/GameContext";
import ConfigContext from "./context/ConfigContext";
import { useBooleanParam } from "./util/query";

import { compileCompanies, overrideCompanies } from "./util";

import schema from "@18xx-maker/schemas/schemas/config.schema.json";

import Divider from "@material-ui/core/Divider";
import Fab from "@material-ui/core/Fab";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Slide from "@material-ui/core/Slide";
import Tooltip from "@material-ui/core/Tooltip";

import ExportIcon from '@material-ui/icons/Collections';
import PdfIcon from "@material-ui/icons/PictureAsPdf";
import PngIcon from "@material-ui/icons/PhotoLibrary";

import assoc from "ramda/src/assoc";
import compose from "ramda/src/compose";
import flatten from "ramda/src/flatten";
import forEach from "ramda/src/forEach";
import is from "ramda/src/is";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import max from "ramda/src/max";
import prop from "ramda/src/prop";
import range from "ramda/src/range";
import reduce from "ramda/src/reduce";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  exportButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'fixed',
    bottom: theme.spacing(14),
    right: theme.spacing(4)
  }
}));

export const maxPlayers = compose(
  reduce(max, 0),
  map(prop("number"))
);

const pngItems = (game, config) => {
  let items = {
    "background": `${game.id}-background.png`,
    "revenue": `${game.id}-revenue.png`,
  };

  // Number Cards
  forEach(n => {
    items[`cards/number/${n}`] = `${game.id}-card-number-${n}.png`;
  }, range(1, maxPlayers(game.players || []) + 1))

  // Privates
  for(let i=0; i<(game.privates || []).length; i++) {
    items[`cards/private/${i}`] = `${game.id}-card-private-${i+1}.png`;
  }

  // Trains
  for(let i=0; i<(game.trains || []).length; i++) {
    items[`cards/train/${i}`] = `${game.id}-card-train-${i+1}-${game.trains[i].name.replace(" ", "_")}.png`;
  }

  // Shares
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  let companies = overrideCompanies(compileCompanies(game), override, selection) || [];
  let shares = flatten(map(c => map(s => assoc('company', c, s), c.shares || []), companies))
  for(let i=0; i<shares.length; i++) {
    items[`cards/share/${i}`] = `${game.id}-card-share-${i+1}-${shares[i].company.abbrev}.png`;
  }

  for(let i=0; i<companies.length; i++) {
    items[`charters/${i}`] = `${game.id}-charter-${i+1}-${companies[i].abbrev}.png`;
  }

  for(let i=0; i<companies.length; i++) {
    items[`tokens/${i}`] = `${game.id}-token-${i+1}-${companies[i].abbrev}.png`
  }

  for(let i=0; i<(game.tokens || []).length; i++) {
    items[`tokens/${i + companies.length}`] = `${game.id}-token-${i+1+companies.length}.png`
  }

  if (game.map) {
    if (is(Array, game.map)) {
      for(let i=0; i<game.map.length; i++) {
        items[`map?variation=${i}`] = `${game.id}-map-${i}.png`;
      }
    } else {
      items["map"] = `${game.id}-map.png`;
    }
  }

  if (game.stock) {
    if (game.stock.market) {
      items["market"] = `${game.id}-market.png`;
    }

    if (game.stock.par && game.stock.par.values) {
      items["par"] = `${game.id}-par.png`;
    }
  }

  if (game.tiles) {
    items["tile-manifest"] = `${game.id}-tile-manifest.png`;

    forEach(id => {
      items[`tiles/${id}`] = `${game.id}-tile-${id}.png`;
    }, keys(game.tiles));
  }

  return items;
};

const pdfItems = (game, config) => {
  let items = {
    "background": `${game.id}-background.pdf`,
    "revenue": `${game.id}-revenue.pdf`,
    "revenue?paginated=true": `${game.id}-revenue-paginated.pdf`,
  };

  if (config.export.allLayouts) {
    forEach(layout => {
      items[`cards?config.cards.layout=${layout}`] = `${game.id}-cards-${layout}.pdf`;
    }, schema.properties.cards.properties.layout.enum);
  } else {
    items["cards"] = `${game.id}-cards.pdf`;
  }

  if (game.companies || game.tokens) {
    if (config.export.allLayouts) {
      forEach(layout => {
        items[`tokens?config.tokens.layout=${layout}`] = `${game.id}-tokens-${layout}.pdf`;
      }, schema.properties.tokens.properties.layout.enum);
    } else {
      items["tokens"] = `${game.id}-tokens.pdf`;
    }
  }

  if (game.companies) {
    items["charters"] = `${game.id}-charters.pdf`;
  }

  if (game.map) {
    if (is(Array, game.map)) {
      for(let i=0; i<game.map.length; i++) {
        items[`map?variation=${i}`] = `${game.id}-map-${i}.pdf`;
        items[`map?paginated=true&variation=${i}`] = `${game.id}-map-${i}-paginated.pdf`;
      }
    } else {
      items["map"] = `${game.id}-map.pdf`;
      items["map?paginated=true"] = `${game.id}-map-paginated.pdf`;
    }
  }

  if (game.stock) {
    if (game.stock.market) {
      items["market"] = `${game.id}-market.pdf`;
      items["market?paginated=true"] = `${game.id}-market-paginated.pdf`;
    }

    if (game.stock.par && game.stock.par.values) {
      items["par"] = `${game.id}-par.pdf`;
      items["par?paginated=true"] = `${game.id}-par-paginated.pdf`;
    }
  }

  if (game.tiles) {
    items["tile-manifest"] = `${game.id}-tile-manifest.pdf`;

    if (config.export.allLayouts) {
      forEach(layout => {
        items[`tiles?config.tiles.layout=${layout}`] = `${game.id}-tiles-${layout}.pdf`;
      }, schema.properties.tiles.properties.layout.enum);
    } else {
      items["tiles"] = `${game.id}-tiles.pdf`;
    }
  }

  return items;
};

const ExportButton = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);
  const [print] = useBooleanParam('print');
  const [menuAnchor, setMenuAnchor] = useState(null);

  if (print || !game) {
    return null;
  }

  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  }

  const handleMenuClose = () => {
    setMenuAnchor(null);
  }

  const ipcRenderer = window.require('electron').ipcRenderer;

  const handleAllPdf = () => {
    ipcRenderer.send('export-pdf', game.slug, pdfItems(game, config));
    handleMenuClose();
  }

  const handleAllPng = () => {
    ipcRenderer.send('export-png', game.slug, pngItems(game, config));
    handleMenuClose();
  }

  const handleSinglePdf = () => {
    ipcRenderer.send('pdf', location.pathname + location.search);
    handleMenuClose();
  };

  const handleSinglePng = () => {
    ipcRenderer.send('screenshot', location.pathname + location.search);
    handleMenuClose();
  };

  return (
    <Route path="/games">
      <Slide direction="left" in={true}>
        <Tooltip title="Export" aria-label="export" placement="left" arrow>
          <Fab onClick={handleMenu}
               position="sticky"
               className={classes.exportButton}
               color="primary">
            <ExportIcon/>
          </Fab>
        </Tooltip>
      </Slide>
      <Menu id="export-menu"
            anchorEl={menuAnchor}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            onClose={handleMenuClose}
            open={Boolean(menuAnchor)}
            keepMounted>
        <MenuItem onClick={handleAllPdf}>
          <ListItemIcon><PdfIcon/></ListItemIcon>
          <ListItemText primary={t('export.allPdf')}/>
        </MenuItem>
        <MenuItem onClick={handleAllPng}>
          <ListItemIcon><PngIcon/></ListItemIcon>
          <ListItemText primary={t('export.allPng')}/>
        </MenuItem>
        <Divider/>
        <MenuItem onClick={handleSinglePdf}>
          <ListItemIcon><PdfIcon/></ListItemIcon>
          <ListItemText primary={t('export.singlePdf')}/>
        </MenuItem>
        <MenuItem onClick={handleSinglePng}>
          <ListItemIcon><PngIcon/></ListItemIcon>
          <ListItemText primary={t('export.singlePng')}/>
        </MenuItem>
      </Menu>
    </Route>
  );
};

export default ExportButton;
