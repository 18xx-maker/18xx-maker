import React, { useContext } from "react";
import { Route } from "react-router";
import GameContext from "./context/GameContext";
import { useBooleanParam } from "./util/query";

import Fab from "@mui/material/Fab";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";

import PrintIcon from "@mui/icons-material/Print";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  printButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: "fixed",
    bottom: theme.spacing(14),
    right: theme.spacing(4),
  },
}));

const PrintButton = () => {
  const classes = useStyles();
  const { game } = useContext(GameContext);
  const [print] = useBooleanParam("print");

  if (print || !game) {
    return null;
  }

  const handler = () => {
    window.print();
  };

  return (
    <Route path="/games">
      <Slide direction="left" in={true}>
        <Tooltip title="Print" aria-label="print" placement="left" arrow>
          <Fab
            onClick={handler}
            position="sticky"
            className={classes.printButton}
            color="primary"
          >
            <PrintIcon />
          </Fab>
        </Tooltip>
      </Slide>
    </Route>
  );
};

export default PrintButton;
