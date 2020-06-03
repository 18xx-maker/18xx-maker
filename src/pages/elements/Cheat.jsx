import React from "react";
import { Link as RouterLink } from "react-router-dom";

import games from "../../data/games";

import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import intersperse from "ramda/src/intersperse";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import max from "ramda/src/max";
import prop from "ramda/src/prop";
import reduce from "ramda/src/reduce";

const Value = ({game, field}) => {
  if (game[field]) {
    return game[field];
  } else {
    return (
      <Table size="small">
        <TableBody>
          {map(p=> (
            <TableRow key={p.number}>
              <TableCell>{p.number}</TableCell>
              <TableCell>{p[field]}</TableCell>
            </TableRow>
          ), game.players || [])}
        </TableBody>
      </Table>
    );
  }
};

const gameRows = map(key => {
  let game = games[key];

  let players = reduce(max, 0, map(prop("number"), game.players || []));
  let links = null;

  if (game.links) {
    links = intersperse(", ", map(name => {
      let url = game.links[name];
      return <Link key={name} variant="caption" href={url}>{name}</Link>;
    }, keys(game.links)));
  }

  return (
    <TableRow key={key}>
      <TableCell>{key}</TableCell>
      <TableCell>
        <Link variant="h6" component={RouterLink} to={`/${key}`}>{game.info.title}</Link>
        {game.info.subtitle && <Typography variant="subtitle1">{game.info.subtitle}</Typography>}
        {links && <Typography>{links}</Typography>}
      </TableCell>
      <TableCell>{game.info.designer}</TableCell>
      <TableCell>{players === 0 ? null : players}</TableCell>
      <TableCell className="bank"><Value game={game} field="bank"/></TableCell>
      <TableCell><Value game={game} field="capital"/></TableCell>
      <TableCell><Value game={game} field="certLimit"/></TableCell>
    </TableRow>
  );
}, keys(games));

const Cheat = () => {
  console.log(games);
  return (
    <Container>
      <Typography component="h1" variant="h4" gutterBottom>
        18xx Game Cheat Sheet
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="18xx game cheat sheet">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Designer</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell>Initial Capital</TableCell>
              <TableCell>Cert Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameRows}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Cheat;
