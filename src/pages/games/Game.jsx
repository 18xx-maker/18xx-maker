import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router";
import { matchPath, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Background from "./Background";
import Cards from "./Cards";
import Charters from "./Charters";
import Map from "./Map";
import Market from "./Market";
import Par from "./Par";
import Revenue from "./Revenue";
import TileManifest from "./TileManifest";
import Tiles from "./Tiles";
import Tokens from "./Tokens";

import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import PlayersIcon from "@material-ui/icons/People";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2)
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
  if (match && (game.id !== match.params.slug)) {
    return <Redirect to={`/games/${match.params.slug}/${match.params.item}`}/>;
  }

  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/games/:slug/background">
          <Background/>
        </Route>
        <Route path="/games/:slug/cards">
          <Cards/>
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
        <Route path="/games/:slug/tiles">
          <Tiles/>
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
                <ListItem>
                  <ListItemIcon><PlayersIcon/></ListItemIcon>
                  <ListItemText primary={`${game.players[0].number} - ${game.players[game.players.length - 1].number}`}
                                secondary={t('game.players')}/>
                </ListItem>
              </List>
            </Paper>
          </Container>
        </Route>
      </Switch>
    </Suspense>
  )
};

export default Game;
