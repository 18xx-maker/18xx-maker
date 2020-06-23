import React from "react";

import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from '@material-ui/icons/Menu';

import IfSideMenu from "./IfSideMenu";

import { makeStyles } from '@material-ui/core/styles';
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
        <IconButton className={classes.menuButton}
                    onClick={onClick}
                    color="inherit"
                    edge="start">
          <MenuIcon/>
        </IconButton>
      </Hidden>
    </IfSideMenu>
  );
};

export default MobileMenuButton;
