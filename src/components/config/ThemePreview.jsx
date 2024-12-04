import tinycolor from "tinycolor2";

import { filter, is, keys, map, sortBy, uniqBy } from "ramda";

import Color from "@/components/Color";

import ColorContext from "@/context/ColorContext";
import { companyThemes, mapThemes } from "@/data";
import { useConfig } from "@/hooks";

const ThemePreview = ({ companies }) => {
  const { config } = useConfig();
  const { theme, companiesTheme } = config;

  // Just use the base color names that don't have crazy options
  const colors = companies
    ? companyThemes[companiesTheme].colors
    : mapThemes[theme].colors;
  const colorNames = sortBy(
    (name) => tinycolor(colors[name]).getLuminance(),
    uniqBy(
      (name) => colors[name],
      filter((name) => is(String, colors[name]), keys(colors)),
    ),
  );

  return (
    <div className="h-8 -mt-3 p-0 border rounded-lg overflow-hidden flex flex-row-reverse flex-auto flex-nowrap gap-0 justify-between items-center">
      <ColorContext.Provider value={companies ? "companies" : undefined}>
        <Color>
          {(c) =>
            map(
              (color) => (
                <div
                  className="grow h-8"
                  key={color}
                  style={{ backgroundColor: c(color) }}
                >
                  &nbsp;
                </div>
              ),
              colorNames,
            )
          }
        </Color>
      </ColorContext.Provider>
    </div>
  );
};

export default ThemePreview;
