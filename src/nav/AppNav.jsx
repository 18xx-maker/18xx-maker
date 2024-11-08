import { forwardRef, useState, useContext } from "react";
import { useMatch } from "react-router";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBooleanParam } from "../util/query";

import MobileMenuButton from "./MobileMenuButton";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import DocumentationIcon from "@mui/icons-material/Help";
import ElementsIcon from "@mui/icons-material/Category";
import HomeIcon from "@mui/icons-material/Home";

import GamesIcon from "@mui/icons-material/Train";
import LoadIcon from "@mui/icons-material/OpenInBrowser";
import MenuIcon from "@mui/icons-material/KeyboardArrowDown";

import makeStyles from "@mui/styles/makeStyles";
import GameContext from "../context/GameContext";

const useStyles = makeStyles((theme) => ({
  activeButton: {
    backgroundColor: theme.palette.background.default,
    "&.Mui-disabled": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor: theme.palette.background.default,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  warningIcon: {
    color: theme.palette.warning.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  menuIcon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const NavLink = ({ active, to, text, icon }) => {
  const classes = useStyles();

  return (
    <Button
      variant={active ? "outlined" : null}
      disabled={!!active}
      color={active ? "primary" : "inherit"}
      className={active ? classes.activeButton : classes.menuButton}
      startIcon={icon}
      component={Link}
      to={to}
    >
      <Typography noWrap>{text}</Typography>
    </Button>
  );
};

const NavMenu = () => {
  const { t } = useTranslation();
  const { game } = useContext(GameContext);
  const match = useMatch("/:section/*");

  return (
    <>
      <NavLink
        to="/"
        active={!match}
        text={t("nav.home")}
        icon={<HomeIcon />}
      />
      {game && (
        <NavLink
          to={`/games/${game.meta.slug}/map`}
          active={
            match &&
            match.params.section === "games" &&
            match.params["*"] !== ""
          }
          text={game.info.title}
          icon={<GamesIcon />}
        />
      )}
      <NavLink
        to="/games/"
        active={
          match && match.params.section === "games" && match.params["*"] === ""
        }
        text={t("nav.load")}
        icon={<LoadIcon />}
      />
      <NavLink
        to="/elements/"
        active={match && match.params.section === "elements"}
        text={t("nav.elements")}
        icon={<ElementsIcon />}
      />
      <NavLink
        to="/docs/"
        active={match && match.params.section === "docs"}
        text={t("nav.docs")}
        icon={<DocumentationIcon />}
      />
    </>
  );
};

const MenuLink = forwardRef(({ to, end = false, icon, text, onClick }, ref) => {
  const match = useMatch({ path: to, end });

  if (match) {
    to = match.pathname;
  }

  return (
    <MenuItem
      onClick={onClick}
      component={Link}
      ref={ref}
      to={to}
      selected={!!match}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </MenuItem>
  );
});
MenuLink.displayName = "MenuLink";

const MobileMenu = ({ anchor, onClose }) => {
  const { t } = useTranslation();
  const open = Boolean(anchor);

  const { game } = useContext(GameContext);

  return (
    <Menu
      id="appnav-menu"
      anchorEl={anchor}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={onClose}
      open={open}
      keepMounted
    >
      <MenuLink
        onClick={onClose}
        to="/"
        end
        text={t("nav.home")}
        icon={<HomeIcon />}
      />
      {game && (
        <MenuLink
          onClick={onClose}
          to={`/games/${game.meta.slug}/map`}
          text={game.info.title}
          icon={<GamesIcon />}
        />
      )}
      <MenuLink
        onClick={onClose}
        to="/games/"
        end
        text={t("nav.load")}
        icon={<LoadIcon />}
      />
      <MenuLink
        onClick={onClose}
        to="/elements/"
        text={t("nav.elements")}
        icon={<ElementsIcon />}
      />
      <MenuLink
        onClick={onClose}
        to="/docs/"
        text={t("nav.docs")}
        icon={<DocumentationIcon />}
      />
    </Menu>
  );
};

const MobileButton = ({ onClick }) => {
  const { t } = useTranslation();
  const { game } = useContext(GameContext);
  const match = useMatch("/:section/*");

  let icon = <HomeIcon />;
  let text = t("nav.home");

  if (match) {
    switch (match.params.section) {
      case "games":
        if (match.params["*"] === "") {
          icon = <LoadIcon />;
          text = t("nav.load");
        } else {
          icon = <GamesIcon />;
          text = game.info.title;
        }
        break;
      case "elements":
        icon = <ElementsIcon />;
        text = t("nav.elements");
        break;
      case "docs":
        icon = <DocumentationIcon />;
        text = t("nav.docs");
        break;
    }
  }

  return (
    <Button
      color="inherit"
      startIcon={icon}
      endIcon={<MenuIcon />}
      onClick={onClick}
      aria-haspopup="true"
    >
      <Typography noWrap>{text}</Typography>
    </Button>
  );
};

const AppNav = ({ toggleSideNav }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [print] = useBooleanParam("print");

  if (print) {
    return null;
  }

  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <AppBar
      position="sticky"
      className={classes.appBar}
      style={{ display: print && "none" }}
    >
      <Toolbar>
        <MobileMenuButton onClick={toggleSideNav} />
        <Typography className={classes.title} variant="h4" noWrap>
          {t("title")}
        </Typography>
        <Box sx={{ display: { md: "none", xs: "block" } }}>
          <MobileButton onClick={handleMenu} />
          <MobileMenu anchor={menuAnchor} onClose={handleMenuClose} />
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <NavMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppNav;
