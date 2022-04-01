import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Background from "./Background";
import Card from "./Card";
import Cards from "./Cards";
import Charter from "./Charter";
import Charters from "./Charters";
import Link from "@material-ui/core/Link";
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

import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import PlayersIcon from "@material-ui/icons/People";

import BGGIcon from "@material-ui/icons/Storage";
import LicenseIcon from "@material-ui/icons/Lock";
import PurchaseIcon from "@material-ui/icons/MonetizationOn";
import RulesIcon from "@material-ui/icons/Gavel";
import WarningIcon from "@material-ui/icons/Warning";

import { makeStyles } from '@material-ui/core/styles';
import { green, blue } from '@material-ui/core/colors';

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
  const match = useMatch('/games/:slug/:item?');

  if (!game) {
    return null;
  }

  if (match && (game.id !== match.params.slug)) {
    return <Navigate to={`/games/${match.params.slug}/${match.params.item}`}/>;
  }

  const page = (
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
  );

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/:slug/b18/map" element={<B18Map/>}/>
        <Route path="/:slug/b18/tiles/:color" element={<B18Tiles/>}/>
        <Route path="/:slug/b18/tokens" element={<B18Tokens/>}/>
        <Route path="/:slug/background" element={<Background/>}/>
        <Route path="/:slug/cards/:type/:index" element={<Card/>}/>
        <Route path="/:slug/cards" element={<Cards/>}/>
        <Route path="/:slug/charters/:index" element={<Charter/>}/>
        <Route path="/:slug/charters" element={<Charters/>}/>
        <Route path="/:slug/map" element={<Map/>}/>
        <Route path="/:slug/market" element={<Market/>}/>
        <Route path="/:slug/par" element={<Par/>}/>
        <Route path="/:slug/revenue" element={<Revenue/>}/>
        <Route path="/:slug/tile-manifest" element={<TileManifest/>}/>
        <Route path="/:slug/tiles/:id" element={<Tile/>}/>
        <Route path="/:slug/tiles" element={<Tiles/>}/>
        <Route path="/:slug/tokens/:index" element={<Token/>}/>
        <Route path="/:slug/tokens" element={<Tokens/>}/>
        <Route path="*" element={page}/>
      </Routes>
    </Suspense>
  )
};

export default Game;
