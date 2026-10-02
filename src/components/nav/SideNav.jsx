import { useRoutes } from "react-router";

import useSideMenu from "@/hooks/useSideMenu";
import { sideRoutes } from "@/routes";
import { Drawer, Toolbar, up, useMediaQuery } from "@/ui";
import { useBooleanParam } from "@/util/query";
import styles from "./SideNav.module.css";

const SideNav = ({ open, toggle }) => {
  const needsSideMenu = useSideMenu();
  const [print] = useBooleanParam("print");
  const element = useRoutes(sideRoutes);
  // The temporary drawer is for narrow screens. Open it only there, so a modal
  // never traps focus behind its own hidden (display: none) panel.
  const isMedium = useMediaQuery(up("md"));

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
        open={open && !isMedium}
        onClose={toggle}
        anchor="left"
        paperClassName={styles.paper}
      >
        {menu}
      </Drawer>
      <Drawer
        data-testid="side-nav"
        variant="permanent"
        className={styles.permanent}
        paperClassName={styles.paper}
      >
        {menu}
      </Drawer>
    </>
  );
};

export default SideNav;
