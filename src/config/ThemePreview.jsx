import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import ColorContext from "../context/ColorContext";
import Color from "../data/Color";

import map from "ramda/src/map";

import themeSchema from "@18xx-maker/schemas/schemas/theme.schema.json";

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

const mapColors = themeSchema.definitions.mapColorName.enum;
const companyColors = themeSchema.definitions.genericColorName.enum;

const ThemePreview = ({companies}) => {

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
              companies ? companyColors : mapColors
            )
          }
        </Color>
      </ColorContext.Provider>
    </AvatarGroup>
  );
};

export default ThemePreview;
