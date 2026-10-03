# Color Themes

Every color on a map, tile, token and charter comes from a theme. There are two
kinds, and you pick each one on the config page (`theme` and `companiesTheme`):

- **Map themes** (`src/data/themes/maps`) color hexes, tiles, track, towns and
  everything else drawn on the map.
- **Company themes** (`src/data/themes/companies`) color the companies: tokens,
  charters, stock markers and company hexes.

To create a new one add a json file to the matching folder. It is picked up
automatically (`src/data/index.js` globs `themes/**/*.json`) and the file name
(without `.json`) is the theme's id.

## Theme files

A theme is a `name` and a `colors` object, validated by the
[theme schema](https://18xx-maker.com/schemas/theme.schema.json):

```json
{
  "name": "My Theme",
  "colors": {
    "yellow": "#fdd800",
    "green": "#91be2e",
    "black": "#110a0c",
    "white": "#fff"
  }
}
```

Colors are hex strings (`#fff`, `#ffffff`, `#ffffff80`) or `rgb(1,2,3)` with no
spaces. Run `pnpm validate` to check your file.

A map theme is used on its own, so it must define every color the map needs:
copy an existing one (`gmt` is the default) and edit it. If the selected map
theme is not found, `gmt` is used. Company themes are different, see below.

## Contexts and phases

A value in `colors` can be a color, or an object that groups colors by
context. The same name can be a different color depending on what is being
drawn:

```json
{
  "colors": {
    "black": "#37383a",
    "track": {
      "default": "#656565",
      "yellow": "#ffc004",
      "green": "#92d051"
    },
    "tile": { "plain": "#d9d9d9", "border": { "yellow": "#d9d9d9" } }
  }
}
```

- Groups like `map`, `tile`, `track`, `town`, `city` and `border` are only used
  by the parts of the drawing that ask for them. When the group has the color
  being looked up it is used, otherwise the top level color is used.
- When the final value is an object it is a **phase** lookup. The phase is the
  color of the hex being drawn (`plain`, `yellow`, `green`, `brown`, `gray`,
  ...) and `default` is used when the phase has no entry.

Look at a map theme such as `src/data/themes/maps/moon.json` for a full example.

## Company themes

Company themes are a flat list of named colors, which a company in a game file
refers to with its `color` field:

```json
{
  "name": "DTG",
  "colors": {
    "black": "#1a1919",
    "blue": "#0089c4",
    "lightBlue": "#b9e5fb",
    "red": "#d8222a"
  }
}
```

The `rob` theme (the default) is always loaded first and the selected theme is
merged over it, so a company theme only needs the colors it changes. These names are also
accepted as aliases: `cyan` (`lightBlue`), `grey` (`gray`), `lightGreen`
(`brightGreen`), `navy` (`navyBlue`) and `purple` (`violet`).

## Colors in a game file

A game can add its own colors with the `colors` field. They are merged over the
selected themes, so a game can both add new names and change existing ones:

```json
{
  "colors": {
    "PGER_orange": "#cc6433",
    "PGER_green": "#1d4922",
    "water": "#4cb2d7"
  }
}
```

A company can then use `"color": "PGER_orange"`. Game colors can use the same
groups and phases as a theme. To change a company color put it in a `companies`
group:

```json
{ "colors": { "companies": { "red": "#aa0000" } } }
```
