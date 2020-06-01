import React from "react";
import { Switch, Route } from "react-router";
import { useTranslation } from "react-i18next";

import Background from "./Background";
import Cards from "./Cards";
import Map from "./Map";

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
 
  if (!game) {
    return null;
  }

  return (
    <Switch>
      <Route path="/games/:slug/map">
        <Map/>
      </Route>
      <Route path="/games/:slug/cards">
        <Cards/>
      </Route>
      <Route path="/games/:slug/background">
        <Background/>
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
  )
};

export default Game;
