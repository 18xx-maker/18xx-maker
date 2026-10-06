# Your first game file

A game is one JSON file. Only `info.title` is required by the [game
schema](/docs/games/schemas); every other top level key is optional, and each
one switches on the pages that use it. The game menu of a loaded game shows the
pages it has data for:

| Key                                  | Pages it enables           |
| ------------------------------------ | -------------------------- |
| `map`                                | Map                        |
| `tiles`                              | Tiles and Tile Manifest    |
| `companies`                          | Tokens and Charters        |
| `tokens`                             | Tokens (without companies) |
| `stock.market`                       | Market                     |
| `stock.par.values`                   | Par                        |
| `privates`, `trains`, `number_cards` | the card sheets on Cards   |

The Cards, Background and Revenue pages are always there. `info` holds the
title, designer, currency and similar. Setting `wip` or `prototype` to `true`
shows a banner that the game is unfinished.

## A small starter

This file validates and has a map, tiles, two companies, a stock market with a
par chart, trains and phases. Save it as `my-game.json`:

```json
{
  "info": {
    "title": "My First 18xx",
    "designer": "Me",
    "currency": "$#"
  },
  "wip": true,
  "companies": [
    {
      "name": "Alpha Railroad",
      "abbrev": "AR",
      "color": "red",
      "tokens": [0, 40, 100]
    },
    {
      "name": "Beta Railway",
      "abbrev": "BR",
      "color": "blue",
      "tokens": [0, 40, 100]
    }
  ],
  "stock": {
    "type": "1D",
    "par": { "values": [60, 70, 80, 90, 100] },
    "market": [[40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160]]
  },
  "trains": [
    { "name": "2", "quantity": 4, "price": 80, "color": "yellow" },
    { "name": "3", "quantity": 3, "price": 180, "color": "green" }
  ],
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    { "name": "3", "limit": 4, "rounds": 2, "tiles": "green", "on": "3" }
  ],
  "tiles": { "7": 3, "8": 3, "9": 3, "57": 2 },
  "map": {
    "hexes": [
      { "color": "plain", "hexes": ["A1", "B1", "C1", "B2"] },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Alphaville" }, "companies": ["AR"] }],
        "hexes": ["A2"]
      },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Betaburg" }, "companies": ["BR"] }],
        "hexes": ["C2"]
      }
    ]
  }
}
```

A few things to notice:

- `map.hexes` is a list of hex definitions. Each one has a `color` and a list of
  coordinates it applies to, so one definition can paint many hexes. A city's
  `companies` puts a company's home token there.
- `tiles` maps a tile number to how many exist. Tile numbers come from the
  generic tiles 18xx Maker knows about. [Elements > Tiles](/elements/tiles)
  lists them, and also each game's own tiles, which another game must define
  itself.
- `trains` and `phases` are described in [Phases and
  Trains](/docs/games/trains).

## Loading and editing

Drag the file into the window, or press `o`. [Files](/docs/files) explains what
the app and the website do with it, including how changes show up (the app
watches the file, the web page needs Refresh). Keep editing the JSON and reload
until it looks right.

To check a file without opening it, run the validator, which prints the path of
every problem:

```bash
pnpm maker validate my-game.json
```

## Where to go next

- Read real games, they are the best reference. Save any bundled game from the
  [Load Games](/games) page, or open it on GitHub in
  [src/data/games](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/games).
  [18Test](https://github.com/18xx-maker/18xx-maker/blob/main/src/data/games/18Test.json)
  is small and uses most features, and [Shikoku 1889](/games/1889) is a
  complete small game.
- [Phases and Trains](/docs/games/trains)
- [Share & Token Types](/docs/games/types)
- [Map Borders & Lines](/docs/games/borders)
- [Positioning](/docs/games/positioning)
- [Logos](/docs/games/logos) and [Company Overrides](/docs/games/overrides)
- [Export Options](/docs/games/exports), to set how your game exports
- [JSON Schemas](/docs/games/schemas), which many editors can use to complete
  and check game files
- [Questions and answers](/docs/faq)
