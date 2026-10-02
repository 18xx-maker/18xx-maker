# Export Options

A game file can say how it is exported with an optional top level `exports`
field. These are the defaults for that game, the same options that `maker export`
has as flags and the _Export options_ panel of the app has as controls. A game
file you share then exports the way you meant it to, without anyone having to
remember the flags.

```json
{
  "info": { "title": "My Game" },
  "exports": {
    "formats": ["pdf", "png"],
    "docs": ["map", "tiles", "cards", "tokens"],
    "layouts": "current",
    "paginated": true,
    "png": { "dpi": 150 },
    "b18": { "version": "1.2", "author": "Me" }
  }
}
```

Every option is optional, leave out what you do not want to set.

## Options

| Option        | Flag                            | Values                                                                                                                       | Default                                                                          |
| ------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `formats`     | `--format`                      | a list of `pdf`, `png` and `b18` (a Board18 box)                                                                             | `["pdf"]`                                                                        |
| `docs`        | `--docs`                        | a list of pages: `background`, `cards`, `charters`, `map`, `market`, `par`, `revenue`, `tile-manifest`, `tiles` and `tokens` | every page of the game                                                           |
| `layouts`     | `--layouts`                     | `all`: a file for every layout of the cards, tiles and tokens, `current`: only the layout of the config                      | the `export.allLayouts` setting of the config                                    |
| `paginated`   | `--paginated`, `--no-paginated` | `true` or `false`: also export the paginated pdfs                                                                            | `false` for `maker export`, `true` in the app                                    |
| `variation`   | `--variation`                   | the number of a map variation, 0 is the first (`--variation all` for every one)                                              | every variation                                                                  |
| `png.dpi`     | `--dpi`                         | a whole number from 1 to 300                                                                                                 | `300`, the size the images print at                                              |
| `b18.version` | `--b18-version`                 | the version of the Board18 box                                                                                               | `1.0`                                                                            |
| `b18.author`  | `--b18-author`                  | the author of the Board18 box                                                                                                | `b18.author` of `maker config` or your name, the designer of the game in the app |

`docs`, `layouts`, `paginated` and `variation` are for the pdf and png files
(a Board18 box has its own images, but takes the `variation`). `png.dpi` is only
for the png files: the images of a Board18 box are always one pixel for each
unit. The pdf files have no options of their own besides the shared ones.

The options that are about where and how the command runs are not part of the
game: `--out`, `--jobs`, `--all`, `--config` and `--debug` are flags only.

## Which value wins

For every option, from the lowest to the highest:

1. the built in default
2. the `exports` of the game file
3. what you choose: the flags of `maker export`, `maker print` and `maker b18`,
   the `b18.author` of `maker config`, your own config (its `export.allLayouts`
   setting is the `layouts` option) and the choices in the _Export options_
   panel

So a game with `"png": { "dpi": 150 }` exports at 150 dpi, `--dpi 300` makes the
same command export at 300 dpi, and the panel in the app starts at 150 and can
be changed before you export. The options are merged one by one: `--format pdf`
does not make the game forget its `png.dpi`, and a `b18.version` in the game
stays when you only give `--b18-author`.

### Overriding a game file

Every option has a flag and a control in the panel, and neither has a default of
its own: what you do not set is what the game file says. To go against the game
file:

| Option        | Flag                                          | Control in the _Export options_ panel         |
| ------------- | --------------------------------------------- | --------------------------------------------- |
| `formats`     | `--format pdf,png`                            | the _Formats_ checkboxes                      |
| `docs`        | `--docs map,cards` (list the pages you want)  | the _Documents_ checkboxes                    |
| `layouts`     | `--layouts all` or `--layouts current`        | _Every layout of a sheet_                     |
| `paginated`   | `--paginated` or `--no-paginated`             | _Paginated pdfs_                              |
| `variation`   | `--variation 0` or `--variation all`          | _Map variation_ (a game with variations only) |
| `png.dpi`     | `--dpi 96`                                    | _PNG resolution (dpi)_                        |
| `b18.version` | `--b18-version 2.0` (`maker b18 <game> 2.0`)  | _Board18 version_                             |
| `b18.author`  | `--b18-author Me` (`maker b18 <game> 2.0 Me`) | _Board18 author_                              |

The panel starts with the game file's values, and _Reset to the game's options_
brings them back after you changed them.

`maker print` always exports pdf files with the paginated ones and `maker b18`
always a Board18 box, whatever `formats` and `paginated` say. `maker b18` takes
the version and the author from the game file when you leave them out. Use
`maker export` for the other options.

## Checking

The `exports` of a game are checked against the [game schema](/docs/games/schemas)
by `pnpm validate` and `maker validate`, and `maker export` refuses a game file
that does not pass it. A resolution of more than 300 dpi, a format or page that
does not exist, a `layouts` that is not `all` or `current` and any option that is
not in the table are all errors, for example:

```
invalid game  my-game.json
#/exports/png/dpi Value in `#/exports/png/dpi` is `301`, but should be `300` at maximum
```

The app does not check a game it opens. It skips an option that is not valid and
uses the next value instead.

## Examples

Only the cards and tokens as pngs, to share with a print shop:

```json
"exports": { "formats": ["png"], "docs": ["cards", "tokens"], "png": { "dpi": 300 } }
```

A game with variations of the map, exported as a Board18 box of the second one:

```json
"exports": { "formats": ["b18"], "variation": 1, "b18": { "version": "2.0" } }
```

Everything a game can be exported as, with a sheet for every layout:

```json
"exports": { "formats": ["pdf", "png", "b18"], "layouts": "all", "paginated": true }
```
