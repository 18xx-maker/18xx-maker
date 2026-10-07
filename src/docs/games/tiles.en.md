# Tiles and Hexes

A game file draws hexes in two places: `tiles` are the tiles players lay and
`map` is the board they are laid on. Both use the same hex definition, so
everything on this page about the content of a hex (`color`, `track`, `cities`,
...) works in both. The fields are in the
[game schema](https://18xx-maker.com/schemas/game.schema.json) and in the
[tiles schema](https://18xx-maker.com/schemas/tiles.schema.json).

## Tiles

`tiles` is an object. Each key is a tile id and the value says how many there
are and, when the tile is not one that 18xx Maker already knows, what it looks
like. Ids can be numbers or letters (`57`, `T1`, `DB801`). There are four forms:

```json
{
  "tiles": {
    "1": 1,
    "2": { "tile": "57", "quantity": 2 },
    "26|T2": 1,
    "63": { "quantity": 2, "print": 3, "rotations": 3 },
    "T1": {
      "quantity": 1,
      "color": "offboard",
      "track": [{ "type": "offboard", "side": 1 }]
    }
  }
}
```

- **A number** is the quantity of a generic tile. The tile comes from the
  generic tiles listed on [Elements > Tiles](/elements/tiles).
- **`tile`** makes the id an alias of another tile. Here `2` is drawn like `57`
  and there are two of them.
- **`id|extra`** is a second copy of the generic tile `id` with a label. The
  part after the `|` is printed small beside the tile number, so `26|T2` is tile
  26 marked T2. The tile is still looked up by the part before the `|`.
- **An object with a `color`** is a full definition of a tile of your own. It
  takes the same fields as a hex, so a tile can have track, cities, towns,
  values, labels and everything in the [element table](#elements) below.
- **An object without a `color`** starts from the generic tile with that id
  and changes or adds fields, for example `quantity`, `print` or `rotations`.

The fields that are about printing a tile rather than drawing it:

| Field            | What it does                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `quantity`       | How many of the tile exist, and how many are printed on the tile sheets and listed on the tile manifest.                                      |
| `print`          | When set and not 0 it is used instead of `quantity` for the sheets, the manifest and the statistics, for example to print spares.             |
| `group`          | Sheets group tiles by color and gauge. `group` sets a name of your own, and `individual` keeps the tile apart from the others.                |
| `clipPath`       | `false` prints the tile without the bleed outline, for tiles with fancy borders or other bleed issues.                                        |
| `stripeRotation` | The angle of the stripes of a striped color such as `yellow/blue`.                                                                            |
| `rotations`      | For [Board18](/docs/output/b18) only: a number to use the first n rotations of the tile, or a list of rotations in degrees (multiples of 60). |
| `broken`         | Marks a tile as not ready to export.                                                                                                          |

The tiles are printed on the tile sheets (see the `tiles` options on the config
page for the layout, the width and the gaps) and listed, with their quantities,
on the tile manifest.

`upgrades` is a field of the game schema that maps a tile id to a list of the
tile ids it upgrades to. It is accepted when the file is validated but nothing
in 18xx Maker draws it.

## Hexes of the Map

`map` holds the hexes of the board. Its `hexes` is a list of hex definitions.
Each definition has a `color` and a list of coordinates in `hexes` that it
applies to, so one definition can paint many hexes:

```json
{
  "map": {
    "hexes": [
      {
        "color": "yellow",
        "track": [{ "type": "straight", "side": 1 }],
        "hexes": ["A13"]
      },
      { "color": "plain", "hexes": ["C11", "C13", "C15"] }
    ]
  }
}
```

Besides `hexes` the map takes the settings of the things drawn over it:
`borders`, `borderTexts` and `lines` (see [Borders and Lines](/docs/games/borders)),
`roundTracker`, `movement`, `market` and `players`. These are the parts of the
map that are not hexes, see the schema for each.

### Half Hexes

A map hex with `half` set to `top`, `bottom`, `left` or `right` draws only that
half, cut through its center, with a border around the part that is drawn (the
cut itself gets none). The directions are those of the page. On a map with
pointy hexes `top` and `bottom` cut through the middle of two sides, `left` and
`right` from corner to corner; on a map with `"orientation": "horizontal"` it
is the other way round. Only the hex is cut: things drawn past its edge, like
its id, a name or a route bonus, are not. Tiles ignore `half`.

```json
{
  "map": {
    "hexes": [{ "color": "plain", "half": "left", "hexes": ["A1"] }]
  }
}
```

## One Map or Many

`map` can be one object, or a list of objects for a game with several maps or
map variations. The list is numbered from 0, and the map selector in the toolbar
chooses which one is shown. Each item can have:

- **`name`** is the name in the selector. For a map other than the first it is
  also printed under the title of the game on the map.
- **`title: false`** leaves the title of the game off this map.
- **`copy`** is the number of another map in the list. This map starts with the
  hexes, `borderTexts`, `borders` and `lines` of that map and adds its own.
- **`remove`** is a list of coordinates. It takes those hexes out of the copied
  map. It is only used together with `copy`.

A variation that is the first map with a few changes:

```json
{
  "map": [
    {
      "name": "Standard",
      "hexes": [{ "color": "plain", "hexes": ["A1", "A3"] }]
    },
    {
      "name": "Variant",
      "copy": 0,
      "remove": ["A3"],
      "hexes": [{ "color": "water", "hexes": ["A5"] }]
    }
  ]
}
```

Everything that exports the map (`--variation` on the command line, the Board18
box) works on one map at a time, see [Exporting](/docs/games/exports).

## Elements

These fields of a hex draw something on it. Every one takes a list. They can be
[positioned](/docs/games/positioning) the same way (with `angle`, `percent`,
`mid`, `side` and so on), and by default 18xx Maker places them for you. Borders
at the edges of hexes and the borders of the map are in
[Borders and Lines](/docs/games/borders). The
[Atoms](/elements/atoms) page draws an example of every one.

| Element                                 | What it draws                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `track`                                 | Track between sides of the hex: `sharp`, `gentle`, `straight` and others, in the gauge you choose |
| `cities`                                | Cities, with their size, and the companies whose home they are                                    |
| `towns`                                 | Towns (the small dits)                                                                            |
| `centerTowns`                           | A town in the middle of a piece of track                                                          |
| `mediumCities`                          | A city between a town and a city in size                                                          |
| `boomtowns`                             | A boomtown                                                                                        |
| `offBoardRevenue`                       | The revenue boxes of an off board hex, with a value for each phase                                |
| `values`                                | A number, such as the revenue of a city                                                           |
| `names`                                 | The name of a place                                                                               |
| `labels`                                | A letter or short text such as `NY`                                                               |
| `icons`                                 | An icon from `src/data/icons`                                                                     |
| `shapes`                                | Plain shapes, with optional text                                                                  |
| `terrain`                               | Terrain such as mountains or water, with its cost                                                 |
| `bridges`, `tunnels`, `tunnelEntrances` | The cost of a bridge or tunnel, and where a tunnel enters                                         |
| `borders`                               | A colored border on a side of the hex                                                             |
| `removeBorders`                         | Removes the border drawn on the listed sides of the hex                                           |
| `half`                                  | Draws only the `top`, `bottom`, `left` or `right` half of a hex of the map                        |
| `divides`                               | A line that divides the hex                                                                       |
| `companies`                             | A company label on the hex, such as the home of a company                                         |
| `tokens`                                | A token placed on the hex                                                                         |
| `goods`                                 | A goods marker                                                                                    |
| `industries`                            | An industry marker with a top and a bottom value                                                  |
| `routeBonuses`                          | A route bonus value                                                                               |

A field the table does not describe well is described in the schema, and each
field has a description there.

## Examples

`src/data/games/18Test.json` is the fixture game and has an example of every
form of `tiles` and of the elements above. The generic tiles are in
`src/data/tiles`, and are good models for a tile of your own.
[Your First Game](/docs/games/first-game) shows a small game with a map and
tiles.
