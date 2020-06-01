import React, { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from "@material-ui/core/Typography";

import { makeStyles } from '@material-ui/core/styles';

import AlertContext from "../context/AlertContext";
import GameContext from "../context/GameContext";

import Game from "./games/Game";

import games from "../data/games";

import assoc from "ramda/src/assoc";
import keys from "ramda/src/keys";
import map from "ramda/src/map";

const useStyles = makeStyles((theme) => ({
  DropBox: {
    borderStyle: 'dashed',
    borderWidth: theme.shape.borderRadius,
    borderColor: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[300],
    height: 200,
    margin: theme.spacing(4,0),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    '& h4': {
      display: 'block',
      marginBottom: theme.spacing(4)
    },

    '& h6': {
      display: 'block'
    }

  },
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    '& p': {
      marginBottom: theme.spacing(2)
    }
  },
  games: {
    maxHeight: '50vh'
  }
}))

const Games = () => {
  const classes = useStyles();
  const { sendAlert } = useContext(AlertContext);
  const { game, loadGame } = useContext(GameContext);

  const handler = (id) => {
    let load;
    if (games[id].local) {
      load = import('../data/games/' + games[id].file);
    } else {
      load = import('@18xx-maker/games/games/' + games[id].file);
    }

    return load.then(pkg => pkg.default)
               .then(assoc('id', id))
               .then(assoc('slug', games[id].slug))
               .then(game => {
                 sendAlert("success", `${game.info.title} loaded!`);
                 loadGame(game);
               });
  };

  const gameRows = map(id => {
    const game = games[id];

    let publisher = game.publisherLink
        ? <Link rel="noreferrer" target="_blank" href={game.publisherLink}>{game.publisher}</Link>
        : game.publisher;

    return (
      <TableRow key={id}>
        <TableCell><Link component="button" onClick={() => handler(id)}>{game.title} - {game.subtitle}</Link></TableCell>
        <TableCell>{game.designer}</TableCell>
        <TableCell>{publisher}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }, keys(games));

  return (
    <Switch>
      <Route path="/games" exact>
        {game && <Redirect to={`/games/${game.slug}/map`}/>}
        <Container maxWidth="md">
          <Paper className={classes.DropBox} elevation={10}>
            <Typography variant="h4" color="textSecondary">Drop any game json into this window to load it.</Typography>
            <Typography variant="subtitle1">You can do this at any time, not only on this page!</Typography>
          </Paper>
          <Paper className={classes.page} elevation={10}>
            <Typography variant="h3">Bundled Games</Typography>
            <Typography variant="body1">
              These games come bundled with 18xx Maker. Please make sure to show your support to the designers and publishers!
            </Typography>
            <TableContainer className={classes.games}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Designer</TableCell>
                    <TableCell>Publisher</TableCell>
                    <TableCell>Players</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameRows}
                </TableBody>
              </Table>
            </TableContainer>
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
