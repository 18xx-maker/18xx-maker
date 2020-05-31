import React from "react";

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { isElectron } from "../util";

const useStyles = makeStyles((theme) => ({
  About: {
    margin: theme.spacing(4, 0)
  },
  Alert: {
    margin: theme.spacing(4, 0)
  }
}));

const Home = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md">
      <Typography variant="body1" className={classes.About}>
        This {isElectron ? "site" : "app"} can take 18xx game
        definitions written in json display them {!isElectron && "in your browser "}ready for
        printing. The original purpose of this site was for personal pnp
        projects, but the purpose has shifted over time into the prototyping
        of new games.
      </Typography>
      <Alert severity="warning" className={classes.Alert}>
        <strong>Important:</strong> do not use this {isElectron ? "app" : "site"} to
        print games that you don't have a license to print. This tool is not meant to
        enable piracy. Please support our 18xx designers, developers and publishers.
      </Alert>
      <Alert severity="info" className={classes.Alert}>
        <strong>Note:</strong> Some games are still works in progress. Please submit
        any bugs found as <Link target="_blank" rel="noreferrer" href="https://github.com/18xx-maker/18xx-maker/issues">issues on github</Link>!
      </Alert>
      <Typography variant="h5">Features</Typography>
      <Typography variant="body1">
        <ul>
          <li>Load a 18xx-maker json game file in order to render it.</li>
          <li>Inspect generic 18xx tiles.</li>
          <li>Change themes/options and render the games with design choices that your game group prefers.</li>
          {!isElectron && <li>Print components directly from your browser.</li>}
          {isElectron && <li>Let the app live reload as you edit your game file locally</li>}
          {isElectron && <li>Export components or full games as pdfs documents or png images.</li>}
          {isElectron && <li>Export games as Board18 game boxes.</li>}
        </ul>
      </Typography>
      <Typography variant="h5">Donations</Typography>
      <Typography variant="body1">
        I've been asked about donation buttons; if you find this software
        useful to you and would like to donate money towards its development
        you can do so via <Link rel="noreferrer" target="_blank" href="https://paypal.me/kelsin">paypal</Link> or <Link rel="noreferrer" target="_blank" href="https://cash.me/$kelsin">square cash</Link>.
      </Typography>
    </Container>
  );
};

export default Home;
