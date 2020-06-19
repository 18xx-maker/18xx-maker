import React, { useContext } from "react";
import { Route, useLocation } from "react-router";
import GameContext from "./context/GameContext";
import { useBooleanParam } from "./util/query";

import Fab from "@material-ui/core/Fab";
import Slide from "@material-ui/core/Slide";
import Tooltip from "@material-ui/core/Tooltip";

import ExportIcon from '@material-ui/icons/Collections';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  exportButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'fixed',
    bottom: theme.spacing(14),
    right: theme.spacing(4)
  }
}));

const ExportButton = () => {
  const classes = useStyles();
  const location = useLocation();
  const { game } = useContext(GameContext);
  const [print] = useBooleanParam('print');

  if (print || !game) {
    return null;
  }

  const handler = () => {
    let ipcRenderer = window.require('electron').ipcRenderer;
    // ipcRenderer.send('pdf', location.pathname + location.search);
    // ipcRenderer.send('screenshot', location.pathname + location.search);
    ipcRenderer.send('export-pdf', game.slug);
    return;
  };

  return (
    <Route path="/games">
      <Slide direction="left" in={true}>
        <Tooltip title="Export" aria-label="export" placement="left" arrow>
          <Fab onClick={handler}
               position="sticky"
               className={classes.exportButton}
               color="primary">
            <ExportIcon/>
          </Fab>
        </Tooltip>
      </Slide>
    </Route>
  );
};

export default ExportButton;
