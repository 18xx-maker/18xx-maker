import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { chain, compose, map, prop, sortBy, values } from "ramda";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import OpenIcon from "@mui/icons-material/FileOpen";

import makeStyles from "@mui/styles/makeStyles";

import * as idb from "@/util/idb";
import GameRow from "@/pages/load/GameRow";
import capability from "@/util/capability";
import { deleteGame, loadSummaries } from "@/state";

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },
  },
}));

const sortSummaries = compose(sortBy(prop("title")), chain(values), values);

const LoadGames = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const summaries = useSelector((state) => state.summaries);
  const navigate = useNavigate();

  // Load all summaries
  useEffect(() => {
    dispatch(loadSummaries());
  }, []);

  const deleteHandler = (slug) => {
    dispatch(deleteGame(slug))
      .then(() => dispatch(loadSummaries()))
      .catch(() => {});
  };

  const gameRows = map(
    (game) => <GameRow game={game} key={game.slug} onDelete={deleteHandler} />,
    sortSummaries(summaries),
  );

  const openGame = (event) => {
    event.preventDefault();

    if (capability.electron) {
      return window.api
        .openGame()
        .then((slug) => navigate(`/games/${slug}/map`));
    }

    if (capability.system) {
      return idb
        .openFilePicker()
        .then((slug) => navigate(`/games/${slug}/map`));
    }
  };

  return (
    <Container maxWidth="md">
      <Paper className={classes.page} elevation={10}>
        <Typography variant="h3">Games</Typography>
        <Typography variant="body1">
          These are games that you have loaded into 18xx Maker previously.
        </Typography>
        {(capability.electron || capability.system) && (
          <Button
            variant="contained"
            onClick={openGame}
            startIcon={<OpenIcon />}
          >
            {t("game.open")}
          </Button>
        )}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Designer</TableCell>
                <TableCell colSpan={2}>Publisher</TableCell>
                <TableCell>Type</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{gameRows}</TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default LoadGames;
