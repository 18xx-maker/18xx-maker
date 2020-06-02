import React, { useContext } from "react";
import Box from "@material-ui/core/Box";
import { needSideMenu } from "./nav/IfSideMenu";
import { useLocation } from "react-router-dom";
import { useTheme } from '@material-ui/core/styles';
import { useBooleanParam } from "./util/query";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GameContext from "./context/GameContext";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  viewport: {
    transitionProperty: 'width, margin-left, margin-right',
    transitionDuration: theme.transitions.duration.shorter,
    transitionTimingFunction: theme.transitions.easing.sharp,
    overflow: 'auto'
  }
}));

const Viewport = ({sideNavOpen, children}) => {
  const classes = useStyles();
  const [print] = useBooleanParam('print');
  const { game } = useContext(GameContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const configOpen = searchParams.has('config');

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.up('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.up('md'));
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

  let marginLeft = '0px';
  let marginRight = '0px';
  if (!print) {
    if (needSideMenu(location, game) && (isMedium || sideNavOpen)) {
      marginLeft = '300px';
    }
    if (configOpen) {
      if (isLarge) {
        marginRight = '35vw';
      } else if(isSmall) {
        marginRight = '50vw';
      }
    }
  }
  let width = `calc(100vw - ${marginLeft} - ${marginRight})`;

  return <Box className={classes.viewport}
              style={{ width, marginLeft, marginRight }}>
           {children}
         </Box>;
};

export default Viewport;
