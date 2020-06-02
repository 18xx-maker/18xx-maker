import React from "react";
import { Route } from "react-router";

import { useBooleanParam } from "../util/query";

import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Toolbar from '@material-ui/core/Toolbar';

import IfSideMenu from "./IfSideMenu";

import { makeStyles } from '@material-ui/core/styles';

import DocsNav from "./DocsNav";
import ElementsNav from "./ElementsNav";
import GameNav from "./GameNav";

const useStyles = makeStyles((theme) => ({
  sideNav: {
    width: 300
  }
}));

const SideNav = ({open, toggle}) => {
  const classes = useStyles();
  const [print] = useBooleanParam('print');

  if (print) {
    return null;
  }

  const menu = (
    <>
      <Toolbar/>
      <Route path="/games">
        <GameNav/>
      </Route>
      <Route path="/elements">
        <ElementsNav/>
      </Route>
      <Route path="/docs">
        <DocsNav/>
      </Route>
    </>
  );

  return (
    <IfSideMenu>
      <Hidden mdUp>
        <Drawer variant="temporary"
                open={open}
                onClose={toggle}
                anchor="left"
                style={{zIndex:1200}}
                transitionDuration={200}
                ModalProps={{keepMounted: true}}
                PaperProps={{className: classes.sideNav}}>
          {menu}
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer variant="permanent"
                PaperProps={{className: classes.sideNav}}>
          {menu}
        </Drawer>
      </Hidden>
    </IfSideMenu>
  );
}

export default SideNav;
