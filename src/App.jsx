import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';

import MenuIcon from '@material-ui/icons/Menu';

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import SetSvgColors from "./data/SetSvgColors";
import ScrollToTop from "./ScrollToTop";

import AppNav from "./AppNav";

import PrintButton from "./PrintButton.jsx";
import ConfigDrawer from "./config/ConfigDrawer.jsx";

import { isElectron } from "./util";

import { BrowserRouter, HashRouter, Route, Switch } from "react-router-dom";

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
  menuButton: {
    marginRight: theme.spacing(2)
  },
  appBar: {
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
  const gameContext = useGame();
  const { alert, closeAlert } = alertContext;

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
                        <IconButton className={classes.menuButton}
                                    color="inherit"
                                    edge="start">
                          <MenuIcon/>
                        </IconButton>
                        <Typography className={classes.title} variant="h4" noWrap>
                          18xx Maker
                        </Typography>
                        <AppNav/>
                      </Toolbar>
                    </AppBar>
                    <PrintButton/>
                    <ConfigDrawer/>
                  </Route>
                </Switch>
                <Switch>
                  <Route path="/" exact>
                    <Home />
                  </Route>
                  <Route path="/elements">
                  </Route>
                  <Route path="/docs" exact>
                    <Docs />
                  </Route>
                  <Route path="/games">
                    <Games />
                  </Route>
                </Switch>
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
