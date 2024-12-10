import { Link as RouterLink } from "react-router";

import { intersperse, keys, map, max, prop, reduce } from "ramda";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { games } from "@/data";

const Value = ({ game, field }) => {
  if (game[field]) {
    return game[field];
  } else {
    return (
      <Table size="small">
        <TableBody>
          {map(
            (p) => (
              <TableRow key={p.number}>
                <TableCell>{p.number}</TableCell>
                <TableCell>{p[field]}</TableCell>
              </TableRow>
            ),
            game.players || [],
          )}
        </TableBody>
      </Table>
    );
  }
};

const gameRows = map((key) => {
  let game = games[key];

  let players = reduce(max, 0, map(prop("number"), game.players || []));
  let links = null;

  if (game.links) {
    links = intersperse(
      ", ",
      map((name) => {
        let url = game.links[name];
        return (
          <Link key={name} variant="caption" href={url} underline="hover">
            {name}
          </Link>
        );
      }, keys(game.links)),
    );
  }

  return (
    <TableRow key={key}>
      <TableCell>{key}</TableCell>
      <TableCell>
        <Link
          variant="h6"
          component={RouterLink}
          to={`/${key}`}
          underline="hover"
        >
          {game.info.title}
        </Link>
        {game.info.subtitle && (
          <Typography variant="subtitle1">{game.info.subtitle}</Typography>
        )}
        {links && <Typography>{links}</Typography>}
      </TableCell>
      <TableCell>{game.info.designer}</TableCell>
      <TableCell>{players === 0 ? null : players}</TableCell>
      <TableCell className="bank">
        <Value game={game} field="bank" />
      </TableCell>
      <TableCell>
        <Value game={game} field="capital" />
      </TableCell>
      <TableCell>
        <Value game={game} field="certLimit" />
      </TableCell>
    </TableRow>
  );
}, keys(games));

const Cheat = () => {
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
          <TableBody>{gameRows}</TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Cheat;
