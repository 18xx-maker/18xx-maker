import tinycolor from "tinycolor2";

import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import makeStyles from "@mui/styles/makeStyles";

import { filter, is, keys, map, sortBy, uniqBy } from "ramda";

import ColorContext from "@/context/ColorContext";
import { companyThemes, mapThemes } from "@/data";
import { useConfig } from "@/hooks";
import Color from "@/util/Color";

const useStyles = makeStyles((theme) => ({
  themeGroup: {
    margin: theme.spacing(1, 0, 0, 0),
    flexWrap: "wrap",
  },
  themeSquare: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
}));

const ThemePreview = ({ companies }) => {
  const { config } = useConfig();
  const { theme, companiesTheme } = config;

  // Just use the base color names that don't have crazy options
  const colors = companies
    ? companyThemes[companiesTheme].colors
    : mapThemes[theme].colors;
  const colorNames = sortBy(
    (name) => tinycolor(colors[name]).getBrightness(),
    uniqBy(
      (name) => colors[name],
      filter((name) => is(String, colors[name]), keys(colors)),
    ),
  );

  const classes = useStyles();

  return (
    <AvatarGroup className={classes.themeGroup}>
      <ColorContext.Provider value={companies ? "companies" : undefined}>
        <Color>
          {(c) =>
            map(
              (color) => (
                <Avatar
                  key={color}
                  variant="square"
                  className={classes.themeSquare}
                  style={{ backgroundColor: c(color) }}
                >
                  &nbsp;
                </Avatar>
              ),
              colorNames,
            )
          }
        </Color>
      </ColorContext.Provider>
    </AvatarGroup>
  );
};

export default ThemePreview;
