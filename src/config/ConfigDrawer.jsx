import React from "react";
import { useLocation, useHistory } from "react-router-dom";

import Config from "./Config";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Fab from "@material-ui/core/Fab";
import Slide from "@material-ui/core/Slide";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ConfigIcon from '@material-ui/icons/Settings';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  configButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  },
  configClose: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0,1),
    ...theme.mixins.toolbar,
    justiyContent: 'flex-start'
  },
  configDrawer: {
    [theme.breakpoints.up('sm')]: {
      width: '50vw'
    },
    [theme.breakpoints.up('lg')]: {
      width: '35vw'
    }
  },
  configToolbar: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: 2,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: theme.palette.divider
  }
}));

const ConfigDrawer = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const visible = searchParams.has('config');

  const toggleConfig = () => {
    if (visible) {
      searchParams.delete('config');
    } else {
      searchParams.set('config', true);
    }

    history.push({search: searchParams.toString()});
  }

  return (
    <>
      <Slide direction="left" in={true}>
        <Tooltip title="Config" aria-label="config">
          <Fab position="sticky" className={classes.configButton} color="secondary" onClick={toggleConfig}>
            <ConfigIcon/>
          </Fab>
        </Tooltip>
      </Slide>
      <Drawer variant="persistent" anchor="right" open={visible}
              PaperProps={{className: classes.configDrawer}}>
        <Toolbar className={classes.configToolbar}>
          <Button startIcon={<ChevronRightIcon/>} onClick={toggleConfig}>Close Config</Button>
        </Toolbar>
        <Config/>
      </Drawer>
    </>
  );
}

export default ConfigDrawer;
