import React, {useState} from "react";
import { Route, Switch, matchPath } from "react-router";
import { useLocation } from "react-router-dom";

import map from "ramda/src/map";

import {Link} from "react-router-dom";

import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import Typography from '@material-ui/core/Typography';

import DocumentationIcon from '@material-ui/icons/Help';
import ElementsIcon from '@material-ui/icons/Category';
import HomeIcon from '@material-ui/icons/Home';
import GamesIcon from '@material-ui/icons/OpenInBrowser';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  activeButton: {
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  }
}));

const menu = [
  {
    to: '/',
    exact: true,
    text: 'Home',
    icon: <HomeIcon/>
  },
  {
    to: '/games',
    text: 'Load Game',
    icon: <GamesIcon/>
  },
  {
    to: '/elements',
    text: 'Game Elements',
    icon: <ElementsIcon/>
  },
  {
    to: '/docs',
    text: 'Documentation',
    icon: <DocumentationIcon/>
  }
];

const NavLink = ({to, exact, text, icon}) => {
  const classes = useStyles();
  const location = useLocation();
  const active = matchPath(location.pathname, { path: to, exact: exact });

  return (
    <Button variant={active && "outlined"}
            color={active ? "primary" : "inherit"}
            className={active && classes.activeButton}
            startIcon={icon}
            component={Link}
            to={to}>
      <Typography noWrap>{text}</Typography>
    </Button>
  );
}
const NavMenu = () => map(item => <NavLink key={item.to} {...item}/>, menu);

const MenuLink = ({icon, text, to, exact, onClick}) => {
  const location = useLocation();
  const active = matchPath(location.pathname, { path: to, exact: exact });

  return (
    <ListItem button onClick={onClick}
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

  return (
    <Menu id="appnav-menu"
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={onClose}
          open={open}
          keepMounted>
      {map(item => <MenuLink key={item.to} onClick={onClose} {...item}/>, menu)}
    </Menu>
  );
};

const MobileButton = ({onClick}) => {
  return (
    <Switch>
      {map(item => (
        <Route exact={item.exact} path={item.to}>
          <Button color="inherit" startIcon={item.icon} onClick={onClick} aria-haspopup="true">
            <Typography noWrap>Menu</Typography>
          </Button>
        </Route>
      ), menu)}
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
