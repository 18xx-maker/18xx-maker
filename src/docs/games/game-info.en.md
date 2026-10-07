# Game Info and Rules

These are the fields of a game file that describe how the game is played, and
which page or file each one feeds. Fields that only change how something looks
(fonts, sizes, positions of the title) are in the
[game schema](https://18xx-maker.com/schemas/game.schema.json) under `info` and
are not repeated here. Phases and trains are in
[Phases and Trains](/docs/games/trains).

## Info

`info` is the one object a game file cannot do without.

| Field                | What it does                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`              | The name of the game: the Info page, the map title and the background page                                                                                   |
| `subtitle`           | A second line under the title on the Info page and the map                                                                                                   |
| `designer`           | The designer, on the Info page and the map                                                                                                                   |
| `publisher`          | The id of a publisher from `src/data/publishers`: its logo and name on the Info page and in the game list                                                    |
| `currency`           | How money is written, with a `#` where the number goes, such as `$#` or `#G`. Prices and revenues use it when the currency options on the config page are on |
| `background`         | The color of the number cards and of the background page. `number_cards` (a list of colors, next to `info`) prints a set of number cards for each color      |
| `marketTokens`       | How many market tokens each company gets, 3 by default                                                                                                       |
| `extraStationTokens` | How many extra station tokens each company gets, on top of the ones in its `tokens`                                                                          |

## Links

`links` is an object of web addresses (`http`, `https` or `mailto`). The Info
page shows the ones you set: `rules` (the rules), `bgg` (the BoardGameGeek
page), `purchase` (where to buy the game) and `license` (the license of the game).

## Players

`players` is a list with one entry for each player count. `number` is
required, and the others are the numbers for that count:

```json
{
  "players": [
    { "number": 3, "certLimit": 20, "capital": 800 },
    { "number": 4, "certLimit": 16, "capital": 600 }
  ]
}
```

- **`number`** is the number of players. The Info page shows the first and last
  entry as the range of players, and a private with `minPlayers` or
  `maxPlayers` (see [Private Companies](/docs/games/privates)) compares itself
  with that range.
- **`bank`** is the money in the bank, a number or `"∞"`.
- **`capital`** is the starting capital of each player, a number or a text.
- **`certLimit`** is the most certificates a player may hold. It is a number, or
  a text with slashes such as `"20/16/13"` for a limit that changes.

`bank`, `capital` and `certLimit` can also be set once for the
whole game, next to `info` and `players`, for a game where they do not change
with the number of players. In the players table of the map, a value set for the
whole game is shown once across all the players and the values in `players` are
not used for that row.

The table of players on the map shows `number`, `bank`, `capital` and
`certLimit`, one column for each entry of `players`. It is drawn where
`map.players` says (see [Tiles and Hexes](/docs/games/tiles)) when the players
table option of the maps on the config page is on.

## Turns

`turns` is a list of the rounds of play that is printed on every charter. Each
turn has a `name` and the `steps` of the turn, and the steps are numbered when
`ordered` is true. `optional` is a second list of steps that a player may or may
not take:

```json
{
  "turns": [
    {
      "name": "Operating Round",
      "steps": ["Lay or upgrade track", "Run trains", "Purchase trains"],
      "ordered": true,
      "optional": ["Purchase private companies"]
    }
  ]
}
```

## Rounds

`rounds` is the list of the rounds of the game in order, for the round tracker.
Each one is a token: a `label`, a `color` and the other fields of a
[token](https://18xx-maker.com/schemas/game.schema.json), such as `icon`. The
round tracker is drawn on the map, where `map.roundTracker` says, and on the
stock market, see [Stock Market](/docs/games/market). The number of rounds is
also in the statistics of the Info page.

## Phases

`phases` is described in [Phases and Trains](/docs/games/trains). Three of its
fields put a sentence in the notes of the phase on the phase chart of the
charters:

- `buy_companies: true` prints `Private companies may be purchased.`
- `events.close_companies: true` prints `Private companies close.`
- `events.remove_tokens: true` prints `Private tokens removed.`

`events` is an object of booleans. Any other event you add is kept in the file
and ignored when printing.

## Work in Progress and Prototype

`wip: true` and `prototype: true` each add a note to the Info page of the game,
so people who open a game that is not finished know. Neither one changes any
other output.

## Groups

`groups` is a list of groups of companies. Each one is drawn as a small mark
that identifies its members: on the private cards, on the charters and on the
president's share of a company. Companies and privates join a group with the id
in their `group` field. Companies and privates without a group, or with an
unknown id, print as before.

A group has an `id` and optionally a `name` (it is not printed, it labels the
group when you pick one in the editor), a `shape` (`circle`, `diamond`,
`ellipse`, `hexagon`, `square` or `triangle`, `circle` by default), a `color`
and `borderColor`, and a `text` with its `textColor`. Without a `color` the mark
is an outline only, and the text color defaults to one that contrasts with the
`color`. The `groups` list is edited as JSON only. Which share is the
president's share is set with `president` on the share, see [Share and Token
Types](/docs/games/types#the-presidents-share):

```json
{
  "groups": [
    { "id": "east", "name": "Eastern", "shape": "square", "color": "blue" },
    { "id": "west", "shape": "diamond", "color": "black", "text": "W" }
  ],
  "companies": [{ "name": "Blue Railroad", "abbrev": "BLU", "group": "east" }],
  "privates": [{ "name": "Mail Contract", "group": "west" }]
}
```

## Which Field Feeds What

| Field                                     | Used by                                   |
| ----------------------------------------- | ----------------------------------------- |
| `info.title`, `subtitle`, `designer`      | Info page, map, background page           |
| `info.publisher`, `links`                 | Info page, game list                      |
| `info.currency`                           | Every price and revenue                   |
| `info.background`, `number_cards`         | Number cards, background page             |
| `info.marketTokens`, `extraStationTokens` | Tokens page, Board18 box                  |
| `players`                                 | Info page (player range), privates, map   |
| `bank`, `capital`, `certLimit`            | Players table on the map                  |
| `turns`                                   | Charters                                  |
| `groups`                                  | Private cards, charters, president shares |
| `rounds`                                  | Round tracker on the map and the market   |
| `phases`                                  | Phase chart on the charters               |
| `wip`, `prototype`                        | Info page                                 |

## Removed Fields

These fields were in the schema but nothing used them for printing, so they
were removed. A game that still has one keeps loading and exporting: the field
is ignored and shows on the Problems page as deprecated. Delete it from the
file.

- `pools`, `floatPercent` and `upgrades` of the game.
- `capitalization` and `mustSellInBlocks` of `info`.
- `subName` of a company.
- `discount` of a train.
- `sym`, `debt`, `abilities` and `image` of a private.
- `broken`, `encoding` and `groups` of a tile and its hex elements.
- `bgFill` and `inverseTextColor` of a token (use `inverseLabelColor` for the
  text color of an inverse token).
- `text` and `textColor` of a token of a tile.
- `textBorderWidth` and `textBorderColor` of the text of a tile element.
