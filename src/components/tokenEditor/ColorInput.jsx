import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Combobox } from "@/components/ui/combobox";

import Color from "@/components/Color";

import { companyThemes, mapThemes } from "@/data";
import { useConfig, useGame } from "@/hooks";

// The names a color can be given by: the colors of the game, of the theme of
// the companies and of the theme of the map. Text is free: any CSS color
// works too.
const useColorNames = () => {
  const { config } = useConfig();
  const game = useGame();
  const { theme, companiesTheme } = config;
  const colors = game?.colors;

  return useMemo(() => {
    const fromTheme = (themes, name, fallback) =>
      (themes[name] ?? themes[fallback])?.colors ?? {};
    const all = {
      ...fromTheme(mapThemes, theme, "gmt"),
      ...fromTheme(companyThemes, companiesTheme, "rob"),
      ...(colors ?? {}),
    };
    return Object.keys(all)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        value: name,
        ...(typeof all[name] === "string" && { label: all[name] }),
      }));
  }, [theme, companiesTheme, colors]);
};

// The native color input only knows #rrggbb
const HEX = /^#[0-9a-f]{6}$/i;

// A color as text with the names of the colors as suggestions, and a swatch
// that is also the picker. The swatch shows the color as the print draws it
// (a theme name or any CSS color). value is the text, onChange the typed text,
// onSelect a name picked from the list or a color picked with the swatch,
// onCommit the text when it is left.
const ColorInput = ({
  value,
  onChange,
  onSelect,
  onCommit,
  pickLabel,
  ...props
}) => {
  const { t } = useTranslation();
  const options = useColorNames();
  const text = value.trim();

  return (
    <div className="flex flex-row items-center gap-2">
      <Color context="companies">
        {(c) => {
          const drawn = (text && c(text)) || text;
          return (
            <span
              className="relative size-9 shrink-0 overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring"
              style={{ backgroundColor: drawn || undefined }}
              data-testid="color-swatch"
            >
              <input
                type="color"
                aria-label={pickLabel}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                value={HEX.test(drawn) ? drawn : "#000000"}
                onChange={(event) => onSelect(event.target.value)}
              />
            </span>
          );
        }}
      </Color>
      <Combobox
        {...props}
        className="min-w-0"
        options={options}
        value={value}
        onValueChange={onChange}
        onSelect={(option) => onSelect(option.value)}
        onEnter={onCommit}
        onBlur={onCommit}
        emptyText={t("editPanel.tokenEditor.noColors", { value })}
      />
    </div>
  );
};

export default ColorInput;
