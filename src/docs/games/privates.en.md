# Private Companies

`privates` is a list with one card for each private company. The cards are
printed on the cards page next to the shares, trains and number cards. Only
`name` is required. The fields are in the
[game schema](https://18xx-maker.com/schemas/game.schema.json).

```json
{
  "privates": [
    {
      "name": "Private with a company",
      "price": 140,
      "revenue": 10,
      "company": "PRR",
      "description": "Description"
    },
    {
      "name": "Private with a token",
      "price": 160,
      "revenue": 15,
      "minPlayers": 3,
      "token": { "color": "green", "label": "3" },
      "description": "Description"
    }
  ]
}
```

## Text

| Field         | What it prints                                        |
| ------------- | ----------------------------------------------------- |
| `name`        | The name, at the top                                  |
| `id`          | A short id such as `P6` in a box in front of the name |
| `note`        | A line of text under the name                         |
| `description` | The text of the private, what it does                 |
| `variant`     | A small label in the bottom right corner              |

`idBackgroundColor` is the color of the box of the `id`.

## Price, Revenue and Bid

- **`price`** is a number or a text. A number is formatted with the currency
  (see below) and a text, such as `"Free"`, is printed as it is.
- **`revenue`** is a number, a list of numbers (printed with a `/` between them,
  for a revenue that changes) or a text such as `"50% / 50%"`. It is printed
  after `Revenue:`.
- **`bid`** prints `Min bid:` and the amount. It is for privates that are
  auctioned.
- **`priceFormat`** and **`revenueFormat`** are a string with a `#`, which is
  replaced by the number: `"priceFormat": "#G"` prints `100G`. They replace the
  `info.currency` of the game for that field, and are not used when the value is a
  text. Without them a number is printed with the `currency` of the game (for
  example `$#`) when the `private` option of the currency settings on the config
  page is on, and plain when it is off.

## Player Limits

`minPlayers` and `maxPlayers` limit the private to some player counts. The card
prints `Players: 3-5` (or `Players: 3` when they are equal) when the limits are
narrower than the range of the game's [players](/docs/games/game-info#players),
and prints nothing when the private is in every game.

## Graphics

A private can show one or more pictures of what it does. They come from these
fields:

- **`hex`** draws the hex of the map at that coordinate, with everything on it.
  It takes the place of a `tile`.
- **`tile`** draws a tile by its id. The tile can be one of the game's own tiles
  or an alias, see [Tiles and Hexes](/docs/games/tiles).
- **`company`** draws the token of the company with that abbreviation.
- **`token`** draws a token you describe in place. It takes the fields of a
  token, such as `color`, `label`, `logo` and `icon`.
- **`icon`** draws an icon from `src/data/icons`, in the `iconColor`.

With the `big` privates style (see the privates option on the config page) the
graphics are drawn in the top right corner of the card and the text goes around
them. With the `small` style they are in a row at the start of the description.
When there are several, each gets part of the width of the row.

The `group` of a private is the id of one of the game's
[groups](/docs/games/game-info#groups). Its mark is drawn in the top right
corner of the name row, next to the `id`, and is not one of the graphics above.

`iconSize` scales all of the graphics of the card. It is a multiplier of the
default size, so `1.25` is a quarter bigger and `0.75` a quarter smaller. With
the `small` style the width stays inside the row, so several graphics still fit.
`18Test.json` has privates of each size to compare.

## Fonts and Colors

Every piece of text has its own font fields, named after the piece. For `name`,
`id`, `note`, `desc` (the description), `price`, `revenue`, `bid`, `variant`
and `players` these are:

| Field               | Example                       |
| ------------------- | ----------------------------- |
| `<piece>FontFamily` | `"nameFontFamily": "display"` |
| `<piece>FontWeight` | `"descFontWeight": "bold"`    |
| `<piece>FontStyle`  | `"noteFontStyle": "italic"`   |
| `<piece>FontSize`   | `"priceFontSize": 14`         |
| `<piece>Color`      | `"revenueColor": "red"`       |

`FontSize` is in points and a whole number. `fontColor` sets the color of all of
the text, and a `<piece>Color` of a piece wins over it. `backgroundColor` is the
color of the card (white by default) and `revenueBackgroundColor` puts a
background behind the revenue. Colors are names from the company
[theme](/docs/games/themes) or any CSS color. `playersFontFamily` and the other
`players` fields style the `Players:` line. When a long description does not
fit, make `descFontSize` smaller.
