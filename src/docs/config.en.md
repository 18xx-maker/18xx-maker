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
  with settings for that game only. It is applied on top of yours only when
  _Allow game config_ is on (Data section, off by default). A game cannot set
  the print scale or that setting. When a game has a `config` that is ignored,
  a warning button appears in the toolbar that opens the Data section. The
  panel shows and edits your settings, not that field.
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
game's own `config` (when allowed).

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
| Fonts                | the family, size, weight and style of the body, title and card fonts                              |
| Data                 | reset, copy, download and import your config, and allow a game's own config                       |

## Fonts

The `fonts` setting gives the font of a kind of text in one place. The Fonts
section sets the family, size, weight and style of the `body`, `title` and
`card` roles (a card has no size). An empty field is not set and shows what it
falls back to, the body font, and only what you set is stored. The other roles
and the `families` names are set in your `config.json`, in the JSON you import
in the Data section, in `?config.fonts...` parameters, or in the `config` of a
game file (the Config tab of the [edit panel](/docs/files)
edits that one). When a game sets `fonts` itself and _Allow game config_ is on,
the section says so: the game wins.

```json
{
  "fonts": {
    "families": { "fancy": "Georgia, serif" },
    "roles": {
      "body": { "family": "fancy" },
      "title": { "weight": "normal", "style": "italic" },
      "card": { "weight": "bold" }
    }
  }
}
```

- A **role** is a kind of text: `body`, `title`, `label`, `revenue`, `token`,
  `price` and `card`. It sets a `family`, a `size` (a number, in the units of
  the page), a `weight` (`normal`, `bold` or a number) and a `style` (`normal`,
  `italic` or `oblique`). Every setting is optional. A role starts from the
  `body` role, and a setting that is not set keeps the default of the text.
- A `family` is a name from `families`, one of the built in `display`, `serif`
  and `sans-serif`, or any CSS font family. System fonts are not embedded in
  exports, see [SVG](/docs/output/svg).
- Today the `title` role sets the names of cities, towns and off-board areas
  and the free-standing hex names, and the `card` role sets the family, weight and style of the text of the
  private company cards. The other roles are for the text that moves over to
  them next.
- The font fields of a tile element or of a game file (such as
  `info.nameFontSize`) still win over a role, so no game changes by itself.
- The parts of `fonts` combine through the layers above: a game's own
  `fonts.roles.title.weight` and your `fonts.roles.title.size` both apply, and
  the game wins when both set the same one (when _Allow game config_ is on).

## Deep links

A section has a name in the address, so you can link to it:
`?config=true&section=tokens` opens the panel on Tokens. The names are `colors`,
`export`, `layout`, `tokens`, `maps`, `tiles`, `stock` (Market), `charters`,
`cards`, `privates`, `trains`, `currency`, `fonts` and `data`. An unknown name opens
Colors and Companies.

## Saving and sharing your config

The Data section shows your changes as `config.json`, which you can download,
copy, or reset back to the defaults with one button. To use a config somewhere
else, import it: see [Importing a config.json](/docs/files#importing-a-configjson).
The same file is what `--config` of the command line takes.

If something does not look right after a change, see the
[questions and answers](/docs/faq).
