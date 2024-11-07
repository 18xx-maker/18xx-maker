import { Route } from "react-router";

import { useBooleanParam } from "../util/query";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

import IfSideMenu from "./IfSideMenu";

import makeStyles from "@mui/styles/makeStyles";

import DocsNav from "./DocsNav";
import ElementsNav from "./ElementsNav";
import GameNav from "./GameNav";

const useStyles = makeStyles(() => ({
  sideNav: {
    width: 300,
  },
}));

const SideNav = ({ open, toggle }) => {
  const classes = useStyles();
  const [print] = useBooleanParam("print");

  if (print) {
    return null;
  }

  const menu = (
    <>
      <Toolbar />
      <Route path="/games">
        <GameNav />
      </Route>
      <Route path="/elements">
        <ElementsNav />
      </Route>
      <Route path="/docs">
        <DocsNav />
      </Route>
    </>
  );

  return (
    <IfSideMenu>
      <Drawer
        variant="temporary"
        sx={{ display: { md: "none", xs: "block" } }}
        open={open}
        onClose={toggle}
        anchor="left"
        style={{ zIndex: 1200 }}
        transitionDuration={200}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: classes.sideNav }}
      >
        {menu}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" } }}
        PaperProps={{ className: classes.sideNav }}
      >
        {menu}
      </Drawer>
    </IfSideMenu>
  );
};

export default SideNav;
