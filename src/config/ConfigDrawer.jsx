import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useBooleanParam } from "../util/query";

import Config from "./Config";

import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ConfigIcon from "@mui/icons-material/Settings";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  configButton: {
    zIndex: theme.zIndex.drawer + 1,
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  configClose: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justiyContent: "flex-start",
  },
  configDrawer: {
    transitionDuration: 1000,
    zIndex: theme.zIndex.drawer + 2,
    [theme.breakpoints.up("sm")]: {
      width: "50vw",
    },
    [theme.breakpoints.up("lg")]: {
      width: "35vw",
    },
  },
  configToolbar: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: 2,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.divider,
  },
}));

const ConfigDrawer = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [print] = useBooleanParam("print");
  const searchParams = new URLSearchParams(location.search);
  const visible = searchParams.has("config");

  if (print) {
    return null;
  }

  const toggleConfig = () => {
    if (visible) {
      searchParams.delete("config");
    } else {
      searchParams.set("config", true);
    }

    history.push({ search: searchParams.toString() });
  };

  return (
    <>
      <Slide direction="left" in={true}>
        <Tooltip title="Config" aria-label="config" placement="left" arrow>
          <Fab
            position="sticky"
            className={classes.configButton}
            color="secondary"
            onClick={toggleConfig}
          >
            <ConfigIcon />
          </Fab>
        </Tooltip>
      </Slide>
      <Drawer
        variant="persistent"
        anchor="right"
        open={visible}
        transitionDuration={300}
        PaperProps={{ className: classes.configDrawer }}
      >
        <Toolbar className={classes.configToolbar}>
          <Button startIcon={<ChevronRightIcon />} onClick={toggleConfig}>
            Close Config
          </Button>
        </Toolbar>
        <Config />
      </Drawer>
    </>
  );
};

export default ConfigDrawer;
