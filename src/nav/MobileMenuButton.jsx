import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import makeStyles from "@mui/styles/makeStyles";

import useSideMenu from "@/hooks/useSideMenu";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

const MobileMenuButton = ({ onClick }) => {
  const needsSideMenu = useSideMenu();
  const classes = useStyles();

  if (!needsSideMenu) return null;

  return (
    <IconButton
      className={classes.menuButton}
      sx={{ display: { md: "none", xs: "block" } }}
      onClick={onClick}
      color="inherit"
      edge="start"
    >
      <MenuIcon />
    </IconButton>
  );
};

export default MobileMenuButton;
