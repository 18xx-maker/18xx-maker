import React, { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from '@material-ui/core/styles';

import AlertContext from "../context/AlertContext";
import GameContext from "../context/GameContext";

import Game from "./games/Game";
// import { isElectron } from "../util";

import assoc from "ramda/src/assoc";
const path = require('path');

const useStyles = makeStyles((theme) => ({
  DropBox: {
    borderStyle: 'dashed',
    borderWidth: '4px',
    borderColor: theme.palette.grey[800],
    backgroundColor: theme.palette.grey[400],
    height: 200,
    margin: theme.spacing(4,0),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}))

const Games = () => {
  const classes = useStyles();
  const { sendAlert } = useContext(AlertContext);
  const { game, loadGame } = useContext(GameContext);

  const loadFile = (file) => {
    file.text()
        .then(JSON.parse)
        .then(assoc('id', path.basename(file.name, '.json')))
        .then(assoc('slug', encodeURIComponent(path.basename(file.name, '.json'))))
        .then(game => {
          sendAlert("success", `${game.info.title} loaded!`);
          loadGame(game);
        })
        .catch(err => sendAlert("error", err.message));
  }

  const dragOverHandler = (event) => {
    event.preventDefault();
  };
  const dropHandler = (event) => {
    event.preventDefault();

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
          loadFile(event.dataTransfer.items[i].getAsFile());
        }
      }
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        loadFile(event.dataTransfer.files[i]);
      }
    }
  };

  return (
    <Switch>
      <Route path="/games" exact>
        {game && <Redirect to={`/games/${game.slug}`}/>}
        <Container maxWidth="md">
          <Paper className={classes.DropBox}
                 onDragOver={dragOverHandler}
                 onDrop={dropHandler}>
            <Typography variant="h4" color="textSecondary">Drop your game json file here</Typography>
          </Paper>
        </Container>
      </Route>
      <Route>
        {!game && <Redirect to="/games"/>}
        <Game game={game}/>
      </Route>
    </Switch>
  );
};

export default Games;
