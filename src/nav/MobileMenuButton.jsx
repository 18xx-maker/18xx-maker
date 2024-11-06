import React from "react";

import Hidden from "@mui/material/Hidden";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';

import IfSideMenu from "./IfSideMenu";

import makeStyles from '@mui/styles/makeStyles';
const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2)
  }
}));

const MobileMenuButton = ({onClick}) => {
  const classes = useStyles();

  return (
    <IfSideMenu>
      <Hidden mdUp>
        <IconButton
          className={classes.menuButton}
          onClick={onClick}
          color="inherit"
          edge="start"
          size="large">
          <MenuIcon/>
        </IconButton>
      </Hidden>
    </IfSideMenu>
  );
};

export default MobileMenuButton;
