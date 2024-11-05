import React, { useContext } from 'react';
import { makeStyles } from "@material-ui/core/styles";

import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import ColorContext from "../context/ColorContext";
import ConfigContext from "../context/ConfigContext";
import Color from "../util/Color";

import tinycolor from "tinycolor2";

import { filter, is, keys, map, sortBy, uniqBy } from "ramda";
import { mapKeys } from "../util";

const useStyles = makeStyles((theme) => ({
  themeGroup: {
    margin: theme.spacing(1, 0, 0, 0),
    flexWrap: 'wrap'
  },
  themeSquare: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
}));

const getThemeName = (file) => file.replace(/^.*\/([^\/]+)\.json$/, (_,x) => x);

const rawMapThemes = import.meta.glob("../data/themes/maps/*.json", { eager: true, import: "default" });
const mapThemes = mapKeys(getThemeName, rawMapThemes);

const rawCompanyThemes = import.meta.glob("../data/themes/companies/*.json", { eager: true, import: "default" });
const companyThemes = mapKeys(getThemeName, rawCompanyThemes);

const ThemePreview = ({companies}) => {
  const { config } = useContext(ConfigContext);
  const { theme, companiesTheme } = config;

  // Just use the base color names that don't have crazy options
  const colors = companies ? companyThemes[companiesTheme].colors : mapThemes[theme].colors;
  const colorNames = sortBy(name => tinycolor(colors[name]).getBrightness(),
                            uniqBy(name => colors[name],
                                   filter(name => is(String, colors[name]),
                                          keys(colors))));

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
              colorNames
            )
          }
        </Color>
      </ColorContext.Provider>
    </AvatarGroup>
  );
};

export default ThemePreview;
