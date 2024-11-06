import React from "react";

import { Link as RouterLink, useHistory } from "react-router-dom";

import { games, publishers } from "../data";
import { useGame } from "../context/GameContext";

import { ascend, identity, keys, map, sort } from "ramda";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from "@mui/material/Typography";

import makeStyles from '@mui/styles/makeStyles';

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

    if (game.info.publisher && publishers[game.info.publisher]) {
      let publisher = publishers[game.info.publisher];

      if (publisher.link) {
        linkNode = <Link rel="noreferrer"
                         target="_blank"
                         href={publisher.link}>
                     {publisher.name}
                   </Link>;
      } else {
        linkNode = publisher.name;
      }

      if (game.info.publisher !== "self") {
        if (publisher.link) {
          imageNode = <Link rel="noreferrer"
                            target="_blank"
                            href={publisher.link}>
                        <img alt={`${publisher.name} Logo`} src={publisher.imageUrl} />
                      </Link>;
        } else {
          imageNode = <img alt={`${publisher.name} Logo`} src={publisher.imageUrl} />;
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
                to={`/games/${game.meta.slug}/map`}>
            {game.info.title}
          </Link>
          {game.info.subtitle && <><br/>{game.info.subtitle}</>}
        </TableCell>
        <TableCell>{game.info.designer}</TableCell>
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
        history.push(`/games/${game.meta.slug}/map`);
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
