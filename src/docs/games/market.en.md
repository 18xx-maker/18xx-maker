# Stock Market and Par Chart

The `stock` field of a game file has the stock market, the par chart and the
legends that go with them. The [Market](/games/18Test/market),
[Par](/games/18Test/par) and [Revenue](/games/18Test/revenue) pages draw it, see
[Game Pages](/docs/games/pages). `18Test.json` has an example of most of what
is described here, and the schema is described in
[Game File Schemas](/docs/games/schemas).

```json
{
  "stock": {
    "type": "2D",
    "market": [
      [
        { "value": 60, "legend": 0, "arrow": "down" },
        67,
        71,
        { "value": 76, "par": true }
      ],
      [null, 60, 66, { "value": 70, "arrow": "up" }]
    ],
    "par": { "values": [76, 71, 67] },
    "legend": [
      { "color": "yellow", "description": "Does not count toward the limit" }
    ],
    "movement": { "up": ["Sold out"], "right": ["Paid dividends"] },
    "display": { "movement": { "x": 5, "y": 0 } }
  }
}
```

## Market type

`stock.type` is `2D`, `1D` or `1Diag`. Always set it: a market without a type
is empty.

- `2D` is a grid. `stock.market` is a list of rows, and rows may be different
  lengths and may start with `null` cells, so a triangle needs no padding.
- `1D` is a single row, `stock.market` is a list of cells. A cell is as tall as
  the column height of the config (4 cells by default), its label is drawn
  rotated, and the abbreviations of its `companies` are written on their bars.
- `1Diag` is a zigzag row. The cells are half a cell apart and every other one
  is a cell row lower, each as tall as the diag height of the config (2 cells).

Set `"title": false` to start the market at the top, without the room for the
title (the same field of `par` hides the par title).

## Cells

A cell is `null` (nothing is drawn), a number (the price, written with the
currency of the market), a string (a label) or an object with these fields:

| Field        | Does                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `value`      | The price, formatted with the market currency. When a cell has a `value`, its `label` is not drawn                                      |
| `label`      | Text instead of a price                                                                                                                 |
| `subLabel`   | A second text in the opposite corner                                                                                                    |
| `color`      | Background color                                                                                                                        |
| `labelColor` | Color of the texts, a readable one is chosen by default                                                                                 |
| `legend`     | The index of an entry of `stock.legend` (0 is the first), the cell takes its color                                                      |
| `par`        | `true` marks a par value, the cell takes the color of the par chart                                                                     |
| `arrow`      | `up`, `down`, `left` or `right`, or a list of them, drawn in a corner of the cell: down and left at the left, up and right at the right |
| `arrowColor` | Color of the arrows                                                                                                                     |
| `companies`  | The abbreviations of companies to draw as bars in the cell, or `{ "abbrev": "PRR", "row": 2 }` to choose the row of the bar             |
| `tokens`     | Tokens drawn in the cell, each with an `x` and `y` (the middle by default). An entry with a `company` is a company token                |
| `width`      | Width of the cell, in cells                                                                                                             |
| `height`     | Height of the cell, in cells                                                                                                            |
| `bottom`     | Draw the cell below the others, so a bigger neighbor covers it                                                                          |
| `underline`  | Underline the text                                                                                                                      |
| `rotated`    | Rotate the label (always on in a 1D and 1Diag market)                                                                                   |
| `subRotated` | Rotate the sub label                                                                                                                    |

The background color of a cell is chosen in this order: the par color when it
is a par cell, the legend entry, its own `color`, the `color` of `stock.cell`,
and a plain one.

`stock.cell` gives the size and color every cell starts with: `width` and
`height` are multiples of the cell size of the config (a `width` of 1.5 is one and a
half cells), and `color` is the default color.

The _Market_ part of the [config panel](?config=true) has the size of a cell,
whether the value is at the top or bottom of a cell, where the arrows are (top,
middle or bottom), the column, diag and par sizes and which parts to display.

## Legend

`stock.legend` is a list of entries with a `description`, a `color` and
optionally a `borderColor`, `borderWidth`, `fontFamily`, `fontSize` and
`fontWeight` (the `icon` is not drawn at the moment). A cell uses an entry by its
index with `legend`.

On a `2D` market the legend is drawn only when `stock.display.legend` says
where: `x` and `y` are in cells from the corner, and an entry is 35 units
below the last one. `reverse` reverses the order, `align` is `left` or `right`,
and `verticalAlign` set to `bottom` stacks the entries upwards. On a `1D`
market the legend is a row under the cells, and on a `1Diag` market it is too,
with `x` and `y` of `display.legend` to move it (in units, not cells). The Display Market
Legend setting of the config turns it all off.

## Par chart

`stock.par.values` is the list of par prices, in rows like the cells of a market.
Each is a number, a string or a cell object, and all of them are par cells:

| Field    | Does                                                  |
| -------- | ----------------------------------------------------- |
| `values` | The cells of the chart                                |
| `color`  | Background color of the par cells, gray by default    |
| `width`  | Width of a cell in cells, 4 by default (the config's) |
| `height` | Height of a cell in cells, 1 by default               |
| `title`  | `false` hides the title above the chart               |

The Par page prints the chart on its own. To draw it on the market as well, set
`stock.display.par` to the `x` and `y` of its corner, in cells. The Display
Market Par Chart setting of the config turns that off.

## Movement legend

`stock.movement` says how the share price moves. Its keys `up`, `down`, `left`
and `right` are lists of texts, drawn as arrows around the word Price. Any other
key, like `2x right` in `18Test.json`, is written below as a line starting with
the key. Draw it on the market with `stock.display.movement` (`x` and `y`, in
cells). A map can draw it too with `map.movement`: do not set both, a market
placed on a map draws its own.

## Round tracker

`stock.display.roundTracker` draws the rounds of the game (`rounds`) as tokens on
the market, so the players can mark the round they are in. `x` and `y` are in
cells, and `type` is `row` (the default), `row-reverse`, `col`, `col-reverse` or
`round`, which puts them on a circle that `rotation` (in degrees) turns. The
Display Market Round Tracker setting of the config turns it off. The same field
of the map, `map.roundTracker`, draws it on the map.

## Ledges

`stock.ledges` draws lines over the market from corner to corner of cells, for
example to mark off a group of cells:

```json
{
  "ledges": [
    {
      "coords": ["4 0", "4 1", "15 1", "15 0", "4 0"],
      "color": "orange",
      "dashed": true
    }
  ]
}
```

Each of `coords` is `"x y"`, a corner of the grid in cells (`0 0` is the top left
corner of the first cell). The other fields are `color`, `width` (3 by default),
`border` with a `borderWidth` to outline the line in the track color, and
`dashed` with `dashArray` and `offset`.

## Display options

`stock.display` has the places of the parts above (`par`, `legend`,
`roundTracker` and `movement`) and `extraTotalWidth` and `extraTotalHeight`, extra
room in units at the right and bottom of the page. A market can also be drawn on
a map with `map.market`, with an `x` and `y`, shown only when the _Maps_ market
setting of the config is on.

## Revenue chart

The Revenue page prints a chart of the numbers from 1 to 100, in rows of 20,
with every fifth number yellow and every tenth orange. The top level
`revenue` field changes it: `min` and `max` are the first and the last number,
and `perRow` how many go in a row. It is not part of `stock`, and every game has
the page.

## Limits

`stock.limits` is a list of ranges of prices (`description`, `color`, `min` and
`max`), such as the allowed par values. It is only kept for reference with the
game: it is not printed.
