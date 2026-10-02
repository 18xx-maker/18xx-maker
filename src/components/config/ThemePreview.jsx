import tinycolor from "tinycolor2";

import { filter, is, keys, map, sortBy, uniqBy } from "ramda";

import Color from "@/components/Color";
import ColorContext from "@/context/ColorContext";
import { companyThemes, mapThemes } from "@/data";
import { useConfig } from "@/hooks";
import { Avatar, AvatarGroup } from "@/ui";
import styles from "./ThemePreview.module.css";

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

  return (
    <AvatarGroup className={styles.themeGroup}>
      <ColorContext.Provider value={companies ? "companies" : undefined}>
        <Color>
          {(c) =>
            map(
              (color) => (
                <Avatar
                  key={color}
                  variant="square"
                  className={styles.themeSquare}
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
