# Game Pages

Every game has a page for each thing it can print. They share one toolbar, and
each page draws its part of the game the way it prints. The address of a game is
`/games/<game id>`, and the address of a page adds its name, like
`/games/18Test/map`.

## The pages

| Page          | Address         | Shows                                                                                | Needs in the game file  |
| ------------- | --------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| Info          | (the game)      | Title, designer, publisher, links, player count and statistics of the game           | `info`                  |
| Map           | `map`           | The map, one variation at a time                                                     | `map`                   |
| Market        | `market`        | The [stock market](/docs/games/market), with the par chart, legend and round tracker | `stock.market`          |
| Tokens        | `tokens`        | Sheets of company tokens and the tokens of the game                                  | `companies` or `tokens` |
| Tiles         | `tiles`         | Sheets of every tile you print, with the quantity of each                            | `tiles`                 |
| Cards         | `cards`         | Privates, shares, trains and number cards                                            |                         |
| Charters      | `charters`      | A charter for every company                                                          | `companies`             |
| Par           | `par`           | The par [chart](/docs/games/market#par-chart) on its own                             | `stock.par.values`      |
| Revenue       | `revenue`       | The [revenue chart](/docs/games/market#revenue-chart)                                |                         |
| Tile manifest | `tile-manifest` | A list of the tiles with their number and quantity                                   | `tiles`                 |
| Background    | `background`    | A page of the game title repeated on the background color                            |                         |

A page the game has no data for is greyed out in the page menu, and opening its
address sends you back to the Info page.

### Info

The page you land on when you open a game. It shows the title, the designer, the
publisher and the links of the game (license, where to buy it, BoardGameGeek and
the rules), and a note when the game is a prototype or work in progress. The
statistics list the tiles by color and gauge, the size of the map, the number of
companies, privates, trains, phases and rounds. The buttons start editing the game
at its first section, download the game file, reload it from its file (in the
browser, for games you loaded from your computer) and forget a game that is not
bundled. See [Files](/docs/files) for where a game is loaded from and how it is
saved.

### Map

The map of the game, with its tiles, tokens, labels and coordinates, and when the
game places them there the market, the round tracker and the movement legend.
A game with several map variations has a variation menu in the toolbar: see
[below](#toolbar). The Paginate switch splits a large map into pages of the
paper size, with cutlines, so it can be printed and pieced together.

### Market

The stock market of the game, with the ledges, the legend, and the par chart,
movement legend and round tracker when the game places them on it. Paginate
splits it into pages of the paper size. Everything about the market is in
[Stock Market and Par Chart](/docs/games/market).

### Tokens

Sheets of the tokens of every company: the market tokens, the reversed ones, the
station tokens and any extra ones, followed by the `tokens` of the game. How they
are laid out, their sizes and the number of each are in the _Tokens_ part of the
[config panel](?config=true).

### Tiles

Every tile of the game's `tiles` as many times as it prints, sorted into groups
of the same color and gauge (a tile can be put in a group of its own with its
`group` field). The layout of the sheets, the width of a tile, the gaps, the cut
border and the pins are in the _Tiles_ part of the config.

### Cards

All the cards of the game on pages: the privates, a card for each share of every
company, the trains and number cards from 1 to the largest player count of the game (their colors
come from `number_cards`). The size and layout of the cards are in the _Cards_ part of the
config.

### Charters

A charter for each company, the majors first and then the minors. The layout
(free, or the 3x1 and 3x2 die layouts), the size of a charter and the page
setup are in the _Charters_ part of the config.

### Par and Revenue

The [par chart](/docs/games/market#par-chart) and the
[revenue chart](/docs/games/market#revenue-chart) are printed on their own, so
they can be cut out and put on the table. Each has a Paginate switch.

### Tile manifest

One small picture of every tile of the game with its number and how many there
are of it, in a column for yellow, green, brown and all other colors. It is
meant as a list for checking that you have all the tiles.

### Background

A page filled with the background color of the game (`info.background`), with
the game title repeated across it at an angle.

## Toolbar

The toolbar at the top left of every game page is not printed. From left to right:

- **Info** goes back to the Info page of the game.
- **Config** opens the [config panel](?config=true) with every print setting.
- **Edit** (`e`) opens the edit panel beside the page, see
  [Files](/docs/files).
- **Refresh** reloads the game from its file, only on the website and only for a
  game you loaded from your computer.
- **Changes** appears when the game differs from its file. It opens the Changes
  page, and the History page lists the saves of the session. They are described
  in [Files](/docs/files) with the problems check.
- The **page menu** switches to another page. Pages the game has no data for
  cannot be chosen, and the number keys `1` to `9` and `0` pick the pages in the
  order of the table above, up to Background.
- **Print** (in the app, **Export**) prints the page or exports the game, see
  [Exports](/docs/games/exports).
- On the map page a **variation menu** picks one of the `map` variations when the
  game defines several. The choice is in the address as `variation`, so
  `?variation=1` is the second one.
- On the cards page a **Filter** menu hides a kind of card: privates, shares,
  trains or number cards.
- On the map, market, par and revenue pages the **Paginate** switch (`n`) splits
  the page for printing on paper, see [Printing a game](/docs).

The tokens, tiles, cards and charters pages are always laid out in pages and have
no Paginate switch. The toolbar is not drawn on the Board18 pages.

## Addresses

The state of a page is in its address, so you can share or bookmark it:

- `?paginated=true` shows a map, market, par or revenue page paginated.
- `?variation=1` shows the second map variation (0 is the first).
- `?hidePrivates=true`, `?hideShares=true`, `?hideTrains=true` and
  `?hideNumbers=true` hide a kind of card on the cards page. Combine them with
  `&`, like `/games/18Test/cards?hidePrivates=true&hideTrains=true`.

See [Files](/docs/files) for the addresses of the config and edit panels.

## Single items

Charters, tokens, cards and tiles also have a page for one item, which the
single image export uses and which is not in the page menu. See
[PNG Output](/docs/output/png).

## Board18 pages

`/games/<id>/b18/map`, `/games/<id>/b18/tiles/<color>` and
`/games/<id>/b18/tokens` are the pages the Board18 export captures: the map and
the tiles of one color at the size and orientation Board18 expects, and the
tokens. They have no toolbar. See [Board18 Output](/docs/output/b18).
