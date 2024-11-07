import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import IfSideMenu from "./IfSideMenu";

import makeStyles from "@mui/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

const MobileMenuButton = ({ onClick }) => {
  const classes = useStyles();

  return (
    <IfSideMenu>
      <IconButton
        className={classes.menuButton}
        sx={{ display: { md: "none", xs: "block" } }}
        onClick={onClick}
        color="inherit"
        edge="start"
      >
        <MenuIcon />
      </IconButton>
    </IfSideMenu>
  );
};

export default MobileMenuButton;
