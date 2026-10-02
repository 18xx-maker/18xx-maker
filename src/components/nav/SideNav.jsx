import { useRoutes } from "react-router";

import Drawer from "@mui/material/Drawer";

import useSideMenu from "@/hooks/useSideMenu";
import { sideRoutes } from "@/routes";
import { Toolbar } from "@/ui";
import { useBooleanParam } from "@/util/query";
import styles from "./SideNav.module.css";

const SideNav = ({ open, toggle }) => {
  const needsSideMenu = useSideMenu();
  const [print] = useBooleanParam("print");
  const element = useRoutes(sideRoutes);

  if (print || !needsSideMenu) {
    return null;
  }

  const menu = (
    <>
      <Toolbar />
      {element}
    </>
  );

  return (
    <>
      <Drawer
        data-testid="side-nav-temporary"
        variant="temporary"
        className={styles.temporary}
        open={open}
        onClose={toggle}
        anchor="left"
        style={{ zIndex: 1200 }}
        transitionDuration={200}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: styles.paper }}
      >
        {menu}
      </Drawer>
      <Drawer
        data-testid="side-nav"
        variant="permanent"
        className={styles.permanent}
        PaperProps={{ className: styles.paper }}
      >
        {menu}
      </Drawer>
    </>
  );
};

export default SideNav;
