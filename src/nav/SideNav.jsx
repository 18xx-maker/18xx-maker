import React from "react";
import { Route } from "react-router";

import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Toolbar from '@material-ui/core/Toolbar';

import { makeStyles } from '@material-ui/core/styles';
import GameNav from "./GameNav";

const useStyles = makeStyles((theme) => ({
  sideNav: {
    width: 200
  }
}));

const SideNav = ({open, toggle}) => {
  const classes = useStyles();

  return (
    <>
      <Hidden mdUp>
        <Drawer variant="temporary"
                open={open}
                onClose={toggle}
                anchor="left"
                ModalProps={{keepMounted: true}}
                PaperProps={{className: classes.sideNav}}>
          <Toolbar/>
          <Route path="/games/:slug">
            <GameNav/>
          </Route>
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer variant="permanent"
                PaperProps={{className: classes.sideNav}}>
          <Toolbar/>
          <Route path="/games/:slug">
            <GameNav/>
          </Route>
        </Drawer>
      </Hidden>
    </>
  );
}

export default SideNav;
