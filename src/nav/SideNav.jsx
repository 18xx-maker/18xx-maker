import { Routes, Route } from "react-router";

import { useBooleanParam } from "../util/query";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import makeStyles from "@mui/styles/makeStyles";

import useSideMenu from "../hooks/useSideMenu";
import DocsNav from "./DocsNav";
import ElementsNav from "./ElementsNav";
import GameNav from "./GameNav";

const useStyles = makeStyles(() => ({
  sideNav: {
    width: 300,
  },
}));

const SideNav = ({ open, toggle }) => {
  const needsSideMenu = useSideMenu();
  const classes = useStyles();
  const [print] = useBooleanParam("print");

  if (print || !needsSideMenu) {
    return null;
  }

  const menu = (
    <>
      <Toolbar />
      <Routes>
        <Route path="/games/*" element={<GameNav />} />
        <Route path="/elements/*" element={<ElementsNav />} />
        <Route path="/docs/*" element={<DocsNav />} />
      </Routes>
    </>
  );

  return (
    <>
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
    </>
  );
};

export default SideNav;
