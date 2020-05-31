import React, {useState, useContext} from "react";
import { Route, Switch, matchPath } from "react-router";
import { useLocation } from "react-router-dom";

import {Link} from "react-router-dom";

import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import DocumentationIcon from '@material-ui/icons/Help';
import ElementsIcon from '@material-ui/icons/Category';
import HomeIcon from '@material-ui/icons/Home';

import GamesIcon from '@material-ui/icons/Train';
import LoadIcon from '@material-ui/icons/OpenInBrowser';
import WarningIcon from '@material-ui/icons/Warning';

import { makeStyles } from '@material-ui/core/styles';
import GameContext from "../context/GameContext";

const useStyles = makeStyles((theme) => ({
  warningIcon: {
    color: theme.palette.warning.main
  },
  errorIcon: {
    color: theme.palette.error.main
  },
  menuIcon: {
    marginRight: theme.spacing(2)
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  activeButton: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  }
}));

const NavLink = ({to, exact, text, icon}) => {
  const classes = useStyles();
  const location = useLocation();
  const active = matchPath(location.pathname, { path: to, exact: exact });

  return (
    <Button variant={active && "outlined"}
            color={active ? "primary" : "inherit"}
            className={active ? classes.activeButton : classes.menuButton}
            startIcon={icon}
            component={Link}
            to={to}>
      <Typography noWrap>{text}</Typography>
    </Button>
  );
}

const getGameItem = (game, tooltip) => {
  let to = "/games";
  let icon = <LoadIcon/>;
  let text = 'Load Games';

  if (game) {
    to = `${to}/${game.slug}`;
    icon = <GamesIcon/>;
    text = game.info.title;

    if (game.wip) {
      if (tooltip) {
        icon = <Tooltip placement="bottom" arrow title="This game is marked as being a work in progress">
                 <WarningIcon/>
               </Tooltip>;
      } else {
        icon = <WarningIcon/>;
      }
    }
  }

  return { to, text, icon };
}

const NavMenu = () => {
  const { game } = useContext(GameContext);

  return (
    <>
      <NavLink to="/" exact text="Home" icon={<HomeIcon/>}/>
      <NavLink {...getGameItem(game, true)}/>
      <NavLink to="/elements" exact text="Game Elements" icon={<ElementsIcon/>}/>
      <NavLink to="/docs" exact text="Documentation" icon={<DocumentationIcon/>}/>
    </>
  );
};

const MenuLink = ({icon, text, to, exact, onClick}) => {
  const location = useLocation();
  const active = Boolean(matchPath(location.pathname, { path: to, exact: exact }));

  return (
    <ListItem button
              onClick={onClick}
              component={Link}
              to={to}
              disabled={active}
              selected={active}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text}/>
    </ListItem>
  );
};

const MobileMenu = ({anchor, onClose}) => {
  const open = Boolean(anchor);

  const { game } = useContext(GameContext);
  const item = getGameItem(game);

  return (
    <Menu id="appnav-menu"
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={onClose}
          open={open}
          keepMounted>
      <MenuLink onClick={onClose} to="/" exact text="Home" icon={<HomeIcon/>}/>
      <MenuLink onClick={onClose} {...item}/>
      <MenuLink onClick={onClose} to="/elements" exact text="Game Elements" icon={<ElementsIcon/>}/>
      <MenuLink onClick={onClose} to="/docs" exact text="Documentation" icon={<DocumentationIcon/>}/>
    </Menu>
  );
};

const MobileButton = ({onClick}) => {
  const { game } = useContext(GameContext);
  const item = getGameItem(game);

  return (
    <Switch>
      <Route path="/" exact>
        <Button color="inherit" startIcon={<HomeIcon/>} onClick={onClick} aria-haspopup="true">
          <Typography noWrap>Menu</Typography>
        </Button>
      </Route>
      <Route path={item.path}>
        <Button color="inherit" startIcon={item.icon} onClick={onClick} aria-haspopup="true">
          <Typography noWrap>Menu</Typography>
        </Button>
      </Route>
      <Route path="/elements">
        <Button color="inherit" startIcon={<ElementsIcon/>} onClick={onClick} aria-haspopup="true">
          <Typography noWrap>Menu</Typography>
        </Button>
      </Route>
      <Route path="/docs">
        <Button color="inherit" startIcon={<DocumentationIcon/>} onClick={onClick} aria-haspopup="true">
          <Typography noWrap>Menu</Typography>
        </Button>
      </Route>
    </Switch>
  );
};

const AppNav = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  }

  const handleMenuClose = () => {
    setMenuAnchor(null);
  }

  return (
    <>
      <Hidden mdUp>
        <MobileButton onClick={handleMenu}/>
        <MobileMenu anchor={menuAnchor} onClose={handleMenuClose}/>
      </Hidden>
      <Hidden smDown>
        <NavMenu/>
      </Hidden>
    </>
  );
}

export default AppNav;
