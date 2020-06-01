import React, { useContext } from "react";
import { Route } from "react-router";
import GameContext from "./context/GameContext";

import Fab from "@material-ui/core/Fab";
import Slide from "@material-ui/core/Slide";
import Tooltip from "@material-ui/core/Tooltip";

import PrintIcon from '@material-ui/icons/Print';

import { makeStyles } from '@material-ui/core/styles';

import { isElectron } from "./util";

const useStyles = makeStyles((theme) => ({
  printButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'fixed',
    bottom: theme.spacing(14),
    right: theme.spacing(4)
  }
}));

const handler = () => {
  if (isElectron) {

  }

  window.print();
};

const PrintButton = () => {
  const classes = useStyles();
  const { game } = useContext(GameContext);

  if (!game) {
    return null;
  }

  return (
    <Route path="/games">
      <Slide direction="left" in={true}>
        <Tooltip title="Print" aria-label="print" placement="left" arrow>
          <Fab onClick={handler}
               position="sticky"
               className={classes.printButton}
               color="primary">
            <PrintIcon/>
          </Fab>
        </Tooltip>
      </Slide>
    </Route>
  );
};

export default PrintButton;
