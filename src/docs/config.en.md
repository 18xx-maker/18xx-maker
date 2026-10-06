# Config Panel

The config panel changes how every game is displayed and printed: colors and
themes, paper size, how tokens, tiles, cards and charters are laid out, and
more. Open it with the _Config_ button in the toolbar of a game page, or from
any page with [?config=true](?config=true).

## How config works

- **Config is global.** The settings apply to every game you look at, print or
  export, not to one game. They are saved with your browser's local storage (the
  app stores them the same way).
- **A game can have its own `config`.** A game file can carry a `config` field
  that is applied on top of yours for that game only. The panel shows and edits
  your settings, not that field.
- **Only your changes are stored.** Every other setting follows the defaults, so
  a new release can improve a default you never touched.
- **Exports use it too.** An export uses your config, with two exceptions: it
  always renders in the light theme and at the real size (the print scale below
  is ignored). See [Export options](/docs/games/exports) for the choices that
  belong to exports.

From lowest to highest, a setting comes from the built in defaults, the
`config.json` the command line was given (see [Command
Line](/docs/output/cli)), what you set in the panel, `?config.<setting>=value`
parameters in the address (for example `?config.cards.layout=die`) and last the
game's own `config`.

## Sections

The drop down at the top of the panel picks a section. Each setting has a label
and a description in the panel, so this is only an overview.

| Section              | What it changes                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Colors and Companies | the color theme, the company color theme, company names and logos, company overrides              |
| Export               | whether exports make a sheet for every layout                                                     |
| Layout               | paper size and margins, and the print scale to correct a printer that prints too big or too small |
| Tokens               | the layout and sizes of the token sheets                                                          |
| Maps                 | what the map shows (coordinates, market, players, round tracker) and how its pages are cut        |
| Tiles                | tile ids, colorblind mode, the layout and width of tile sheets                                    |
| Market               | cell size, arrows and what the market page shows                                                  |
| Charters             | the charter style and layout, borders, the phase chart and turn order, train cards                |
| Cards                | share and card styles, sizes, bleed and padding, the die cards                                    |
| Privates             | the style of the private companies                                                                |
| Trains               | the style of the trains and whether they show images                                              |
| Currency             | how money is written for each kind of amount                                                      |
| Data                 | reset, copy, download and import your config                                                      |

## Deep links

A section has a name in the address, so you can link to it:
`?config=true&section=tokens` opens the panel on Tokens. The names are `colors`,
`export`, `layout`, `tokens`, `maps`, `tiles`, `stock` (Market), `charters`,
`cards`, `privates`, `trains`, `currency` and `data`. An unknown name opens
Colors and Companies.

## Saving and sharing your config

The Data section shows your changes as `config.json`, which you can download,
copy, or reset back to the defaults with one button. To use a config somewhere
else, import it: see [Importing a config.json](/docs/files#importing-a-configjson).
The same file is what `--config` of the command line takes.

If something does not look right after a change, see the
[questions and answers](/docs/faq).
