import React from "react";
import { Routes, Route } from "react-router";

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
      <Routes>
        <Route path="/games/:slug/*" element={<GameNav/>}/>
        <Route path="/elements/*" element={<ElementsNav/>}/>
        <Route path="/docs/*" element={<DocsNav/>}/>
      </Routes>
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
