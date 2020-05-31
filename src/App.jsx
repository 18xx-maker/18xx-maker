import React, { useState } from "react";

import { Route, Switch } from "react-router";
import { BrowserRouter, HashRouter } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import SetSvgColors from "./data/SetSvgColors";
import ScrollToTop from "./ScrollToTop";

import AppNav from "./nav/AppNav";
import SideNav from "./nav/SideNav";
import MobileMenuButton from "./nav/MobileMenuButton";

import PrintButton from "./PrintButton.jsx";
import ConfigDrawer from "./config/ConfigDrawer.jsx";
import Viewport from "./Viewport";

import { isElectron } from "./util";

import AlertContext, { useAlert } from "./context/AlertContext";
import GameContext, { useGame } from "./context/GameContext";

import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Games from "./pages/Games";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const Router = isElectron ? HashRouter : BrowserRouter;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  configButton: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  }
}));

const theme = createMuiTheme({});

const App = () => {
  const classes = useStyles();

  // Success, Warning and Error Alerts
  const alertContext = useAlert();
  const { alert, closeAlert } = alertContext;

  // What game are we showing
  const gameContext = useGame();

  // Side panel state
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const toggleSideNav = () => setSideNavOpen(!sideNavOpen);

  return (
    <ThemeProvider theme={theme}>
      <AlertContext.Provider value={alertContext}>
        <GameContext.Provider value={gameContext}>
          <Router>
            <ScrollToTop>
              <div className={classes.root}>
                <Switch>
                  <Route path="/render"></Route>
                  <Route>
                    <AppBar position="sticky" className={classes.appBar}>
                      <Toolbar>
                        <MobileMenuButton onClick={toggleSideNav}/>
                        <Typography className={classes.title} variant="h4" noWrap>
                          18xx Maker
                        </Typography>
                        <AppNav/>
                      </Toolbar>
                    </AppBar>
                    <SideNav open={sideNavOpen} toggle={toggleSideNav}/>
                    <PrintButton/>
                    <ConfigDrawer/>
                  </Route>
                </Switch>
                <Viewport sideNavOpen={sideNavOpen}>
                  <Switch>
                    <Route path="/" exact>
                      <Home />
                    </Route>
                    <Route path="/elements">
                    </Route>
                    <Route path="/docs">
                      <Docs />
                    </Route>
                    <Route path="/games">
                      <Games />
                    </Route>
                  </Switch>
                </Viewport>
                <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                          open={alert.open}
                          onClose={closeAlert}
                          autoHideDuration={6000}>
                  <Alert severity={alert.type}>{alert.message}</Alert>
                </Snackbar>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{height:0,width:0,position:"absolute"}}>
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                            markerWidth="5" markerHeight="5"
                            markerUnits="strokeWidth"
                            orient="auto-start-reverse">
                      <path d="M 0 0 L 8 4 L 8 6 L 0 10 z"
                            strokeLinejoin="round"
                            strokeLinecap="round" />
                    </marker>
                    <mask id="hexMask">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMask">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskOffset">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-86.6025,0 -92.376,-9.999995337 -54.84825,-75 -43.30125,-75 -37.52775,-85 37.52775,-85 43.30125,-75 54.84825,-75 92.376,-9.999995337 86.6025,0 92.376,9.999995337 54.84825,75 43.30125,75 37.52775,85 -37.52775,85 -43.30125,75 -54.84825,75 -92.376,9.999995337"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDie">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 54.84825,75 -54.84825,75"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDieTop">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 54.84825,75 -54.84825,75"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDieBottom">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 49.07475,85 -49.07475,85"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                  </defs>
                </svg>
              </div>
              <SetSvgColors />
            </ScrollToTop>
          </Router>
        </GameContext.Provider>
      </AlertContext.Provider>
    </ThemeProvider>
  );
};

export default App;
