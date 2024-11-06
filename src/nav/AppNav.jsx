import React, {useState, useContext} from "react";
import { Route, Switch, matchPath } from "react-router";
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useBooleanParam } from "../util/query";

import { Link } from "react-router-dom";

import MobileMenuButton from "./MobileMenuButton";

import AppBar from "@mui/material/AppBar";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import DocumentationIcon from '@mui/icons-material/Help';
import ElementsIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';

import GamesIcon from '@mui/icons-material/Train';
import LoadIcon from '@mui/icons-material/OpenInBrowser';
import MenuIcon from '@mui/icons-material/KeyboardArrowDown';

import makeStyles from '@mui/styles/makeStyles';
import GameContext from "../context/GameContext";

const useStyles = makeStyles((theme) => ({
  activeButton: {
    backgroundColor: theme.palette.background.default,
    "&.Mui-disabled": {
      color: theme.palette.primary.main
    },
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  warningIcon: {
    color: theme.palette.warning.main
  },
  errorIcon: {
    color: theme.palette.error.main
  },
  menuIcon: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

const NavLink = ({to, exact, text, icon, path}) => {
  const classes = useStyles();
  const location = useLocation();
  const active = matchPath(location.pathname, { path: (path || to), exact: exact });

  return (
    <Button variant={active && "outlined"}
            disabled={!!active}
            color={active ? "primary" : "inherit"}
            className={active ? classes.activeButton : classes.menuButton}
            startIcon={icon}
            component={Link}
            to={to}>
      <Typography noWrap>{text}</Typography>
    </Button>
  );
}

const NavMenu = () => {
  const { t } = useTranslation();
  const { game } = useContext(GameContext);

  return (
    <>
      <NavLink to="/" exact text={t('nav.home')} icon={<HomeIcon/>}/>
      {game && <NavLink to={`/games/${game.meta.slug}/map`}
                        path={`/games/${game.meta.slug}`}
                        text={game.info.title}
                        icon={<GamesIcon/>}/>}
      <NavLink to="/games/" exact text={t('nav.load')} icon={<LoadIcon/>}/>
      <NavLink to="/elements/" text={t('nav.elements')} icon={<ElementsIcon/>}/>
      <NavLink to="/docs/" text={t('nav.docs')} icon={<DocumentationIcon/>}/>
    </>
  );
};

const MenuLink = React.forwardRef(({icon, text, to, path, exact, onClick}, ref) => {
  const location = useLocation();
  const active = Boolean(matchPath(location.pathname,
                                   { path: (path || to),
                                     exact: exact }));

  return (
    <MenuItem onClick={onClick}
              component={Link}
              ref={ref}
              to={to}
              selected={active}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text}/>
    </MenuItem>
  );
});

const MobileMenu = ({anchor, onClose}) => {
  const { t } = useTranslation();
  const open = Boolean(anchor);

  const { game } = useContext(GameContext);

  return (
    <Menu id="appnav-menu"
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={onClose}
          open={open}
          keepMounted>
      <MenuLink onClick={onClose} to="/" exact text={t('nav.home')} icon={<HomeIcon/>}/>
      {game && <MenuLink onClick={onClose}
                         to={`/games/${game.meta.slug}/map`}
                         path={`/games/${game.meta.slug}/`}
                         text={game.info.title}
                         icon={<GamesIcon/>}/>}
      <MenuLink onClick={onClose} to="/games/" exact text={t('nav.load')} icon={<LoadIcon/>}/>
      <MenuLink onClick={onClose} to="/elements/" text={t('nav.elements')} icon={<ElementsIcon/>}/>
      <MenuLink onClick={onClose} to="/docs/" text={t('nav.docs')} icon={<DocumentationIcon/>}/>
    </Menu>
  );
};

const MobileButton = ({onClick}) => {
  const { t } = useTranslation();
  const { game } = useContext(GameContext);

  return (
    <Switch>
      <Route path="/" exact>
        <Button color="inherit"
                startIcon={<HomeIcon/>}
                endIcon={<MenuIcon/>}
                onClick={onClick}
                aria-haspopup="true">
          <Typography noWrap>{t('nav.home')}</Typography>
        </Button>
      </Route>
      {game && <Route path={`/games/${game.meta.slug}/`}>
                 <Button color="inherit"
                         startIcon={<GamesIcon/>}
                         endIcon={<MenuIcon/>}
                         onClick={onClick}
                         aria-haspopup="true">
                   <Typography noWrap>{game.info.title}</Typography>
                 </Button>
               </Route>}
      <Route path="/games/" exact>
        <Button color="inherit"
                startIcon={<LoadIcon/>}
                endIcon={<MenuIcon/>}
                onClick={onClick}
                aria-haspopup="true">
          <Typography noWrap>{t('nav.load')}</Typography>
        </Button>
      </Route>
      <Route path="/elements">
        <Button color="inherit"
                startIcon={<ElementsIcon/>}
                endIcon={<MenuIcon/>}
                onClick={onClick} aria-haspopup="true">
          <Typography noWrap>{t('nav.elements')}</Typography>
        </Button>
      </Route>
      <Route path="/docs">
        <Button color="inherit"
                startIcon={<DocumentationIcon/>}
                endIcon={<MenuIcon/>}
                onClick={onClick}
                aria-haspopup="true">
          <Typography noWrap>{t('nav.docs')}</Typography>
        </Button>
      </Route>
    </Switch>
  );
};

const AppNav = ({toggleSideNav}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [print] = useBooleanParam('print');

  if (print) {
    return null;
  }

  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  }

  const handleMenuClose = () => {
    setMenuAnchor(null);
  }

  return (
    <AppBar position="sticky" className={classes.appBar} style={{display: print && "none"}}>
      <Toolbar>
        <MobileMenuButton onClick={toggleSideNav}/>
        <Typography className={classes.title} variant="h4" noWrap>
          {t('title')}
        </Typography>
        <Box sx={{ display: { md: 'none', xs: 'block' } }}>
          <MobileButton onClick={handleMenu} />
          <MobileMenu anchor={menuAnchor}
                      onClose={handleMenuClose} />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <NavMenu/>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppNav;
