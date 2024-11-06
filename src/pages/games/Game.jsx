import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { matchPath, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Background from "./Background";
import Card from "./Card";
import Cards from "./Cards";
import Charter from "./Charter";
import Charters from "./Charters";
import Link from "@mui/material/Link";
import Map from "./Map";
import Market from "./Market";
import Par from "./Par";
import Revenue from "./Revenue";
import TileManifest from "./TileManifest";
import Tile from "./Tile";
import Tiles from "./Tiles";
import Token from "./Token";
import Tokens from "./Tokens";

import B18Map from "./b18/Map";
import B18Tiles from "./b18/Tiles";
import B18Tokens from "./b18/Tokens";

import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import PlayersIcon from "@mui/icons-material/People";

import BGGIcon from "@mui/icons-material/Storage";
import LicenseIcon from "@mui/icons-material/Lock";
import PurchaseIcon from "@mui/icons-material/MonetizationOn";
import RulesIcon from "@mui/icons-material/Gavel";
import WarningIcon from "@mui/icons-material/Warning";

import makeStyles from '@mui/styles/makeStyles';
import { green, blue } from '@mui/material/colors';

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2)
  },
  warning: {
    color: theme.palette.warning.main
  }
}));

const Game = ({game}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();

  if (!game) {
    return null;
  }

  const match = matchPath(location.pathname,
                          { path: '/games/:slug/:item?' });
  if (match && (game.meta.id !== match.params.slug)) {
    return <Redirect to={`/games/${match.params.slug}/${match.params.item}`}/>;
  }

  return (
    <Switch>
      <Route path="/games/:slug/b18/map">
        <B18Map/>
      </Route>
      <Route path="/games/:slug/b18/tiles/:color*">
        <B18Tiles/>
      </Route>
      <Route path="/games/:slug/b18/tokens">
        <B18Tokens/>
      </Route>
      <Route path="/games/:slug/background">
        <Background/>
      </Route>
      <Route path="/games/:slug/cards/:type/:index">
        <Card/>
      </Route>
      <Route path="/games/:slug/cards">
        <Cards/>
      </Route>
      <Route path="/games/:slug/charters/:index">
        <Charter/>
      </Route>
      <Route path="/games/:slug/charters">
        <Charters/>
      </Route>
      <Route path="/games/:slug/map">
        <Map/>
      </Route>
      <Route path="/games/:slug/market">
        <Market/>
      </Route>
      <Route path="/games/:slug/par">
        <Par/>
      </Route>
      <Route path="/games/:slug/revenue">
        <Revenue/>
      </Route>
      <Route path="/games/:slug/tile-manifest">
        <TileManifest/>
      </Route>
      <Route path="/games/:slug/tiles/:id">
        <Tile/>
      </Route>
      <Route path="/games/:slug/tiles">
        <Tiles/>
      </Route>
      <Route path="/games/:slug/tokens/:index">
        <Token/>
      </Route>
      <Route path="/games/:slug/tokens">
        <Tokens/>
      </Route>
      <Route>
        <Container maxWidth="md">
          <Paper elevation={5} className={classes.page}>
            <Typography variant="h3">{game.info.title}</Typography>
            {game.info.subtitle && <Typography variant="h5">{game.info.subtitle}</Typography>}
            <Typography variant="h6">{t('game.by')} {game.info.designer}</Typography>
            <List>
              {game.players && <ListItem>
                                  <ListItemIcon><PlayersIcon/></ListItemIcon>
                                  <ListItemText primary={`${game.players[0].number} - ${game.players[game.players.length - 1].number}`}
                                                secondary={t('game.players')}/>
                                </ListItem>}
              {game.links && game.links.license && (
                <ListItem button
                          component={Link}
                          color="inherit"
                          underline="none"
                          target="_blank"
                          href={game.links.license}>
                  <ListItemIcon><LicenseIcon color="error" /></ListItemIcon>
                  <ListItemText primary={t('game.license.primary')} secondary={t('game.license.secondary')} />
                </ListItem>
              )}
              {game.links && game.links.purchase && (
                <ListItem button
                          component={Link}
                          color="inherit"
                          underline="none"
                          target="_blank"
                          href={game.links.purchase}>
                  <ListItemIcon><PurchaseIcon style={{color: green[500]}}/></ListItemIcon>
                  <ListItemText primary={t('game.purchase.primary')} secondary={t('game.purchase.secondary')} />
                </ListItem>
              )}
              {game.links && game.links.bgg && (
                <ListItem button
                          component={Link}
                          color="inherit"
                          underline="none"
                          target="_blank"
                          href={game.links.bgg}>
                  <ListItemIcon><BGGIcon/></ListItemIcon>
                  <ListItemText>{t('game.bgg')}</ListItemText>
                </ListItem>
              )}
              {game.links && game.links.rules && (
                <ListItem button
                          component={Link}
                          color="inherit"
                          underline="none"
                          target="_blank"
                          href={game.links.rules}>
                  <ListItemIcon><RulesIcon/></ListItemIcon>
                  <ListItemText primary={t('game.rules')} />
                </ListItem>
              )}
              {game.prototype && (
                <ListItem>
                  <ListItemIcon><WarningIcon style={{color: blue[500]}}/></ListItemIcon>
                  <ListItemText primary={t('prototype.prototype')} secondary={t('prototype.description')}/>
                </ListItem>
              )}
              {game.wip && (
                <ListItem>
                  <ListItemIcon><WarningIcon className={classes.warning}/></ListItemIcon>
                  <ListItemText primary={t('wip.wip')} secondary={t('wip.description')}/>
                </ListItem>
              )}
            </List>
          </Paper>
        </Container>
      </Route>
    </Switch>
  )
};

export default Game;
