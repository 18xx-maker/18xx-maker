import useSideMenu from "@/hooks/useSideMenu";
import { IconButton, Menu as MenuIcon } from "@/ui";
import styles from "./MobileMenuButton.module.css";

const MobileMenuButton = ({ onClick }) => {
  const needsSideMenu = useSideMenu();

  if (!needsSideMenu) return null;

  return (
    <IconButton
      className={styles.menuButton}
      onClick={onClick}
      aria-label="menu"
      color="inherit"
      edge="start"
    >
      <MenuIcon />
    </IconButton>
  );
};

export default MobileMenuButton;
