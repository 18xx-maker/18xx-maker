import React from "react";

import { Link as RouterLink, useHistory } from "react-router-dom";

import games from "../data/games";
import { publishers } from "@18xx-maker/games";
import { useGame } from "../context/GameContext";

import ascend from "ramda/src/ascend";
import identity from "ramda/src/identity";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import sort from "ramda/src/sort";

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
      display: 'block'
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
    minHeight: 520,
    height: 'calc(100vh - 480px)'
  }
}))

const LoadGames = () => {
  const history = useHistory();
  const classes = useStyles();
  const { loadGame } = useGame();

  const gameRows = map(id => {
    const game = games[id];

    let linkNode = null;
    let imageNode = null;

    if (game.publisher) {
      let publisher = publishers[game.publisher];

      if (publisher.link) {
        linkNode = <Link rel="noreferrer"
                         target="_blank"
                         href={publishers[game.publisher].link}>
                     {publishers[game.publisher].name}
                   </Link>;
      } else {
        linkNode = publisher.name;
      }

      if (game.publisher !== "self") {
        if (publisher.link) {
          imageNode = <Link rel="noreferrer"
                            target="_blank"
                            href={publishers[game.publisher].link}>
                        <img alt={`${publisher.name} Logo`} src={`/publishers/${game.publisher}.png`}/>
                      </Link>;
        } else {
          imageNode = <img alt={`${publisher.name} Logo`} src={`/publishers/${game.publisher}.png`}/>;
        }
      }
    }

    let publisherNode = (
      <>
        <TableCell>
          {linkNode}
        </TableCell>
        <TableCell style={{textAlign: "center"}}>
          {imageNode}
        </TableCell>
      </>
    );

    return (
      <TableRow key={id}>
        <TableCell>
          <Link component={RouterLink}
                variant="h5"
                to={`/games/${game.slug}/map`}>
            {game.title}
          </Link>
          {game.subtitle && <><br/>{game.subtitle}</>}
        </TableCell>
        <TableCell>{game.designer}</TableCell>
        {publisherNode}
      </TableRow>
    );
  }, sort(ascend(identity), keys(games)));

  const getEventFile = (event) => {
    if (event.dataTransfer.items) {
      if (event.dataTransfer.items[0].kind === 'file') {
        return event.dataTransfer.items[0].getAsFile();
      }
    }

    return event.dataTransfer.files[0];
  };
  const dragOverHandler = (event) => {
    event.preventDefault();
  };
  const dropHandler = (event) => {
    event.preventDefault();

    loadGame(getEventFile(event))
      .then(game => {
        history.push(`/games/${game.slug}/map`);
      });
  };

  return (
    <Container maxWidth="md">
      <Paper className={classes.DropBox}
             onDragOver={dragOverHandler}
             onDrop={dropHandler}
             elevation={10}>
        <Typography variant="h4" align="center" color="textSecondary">Drop any game json here to load it!</Typography>
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
                <TableCell colSpan={2}>Publisher</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameRows}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default LoadGames;
