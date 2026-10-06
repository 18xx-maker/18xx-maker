# 18xx Maker CLI

We expose some useful commands in the form of a NodeJS command line program.

The normal way to run this command is via pnpm or node directly:

```shell
# Run via pnpm
pnpm maker help

# Run via node
node ./bin/maker.js help
```

> [!TIP]
> I find it useful to create this alias so I can use the CLI directly as `maker`
> in my shell without pnpm's default output:
>
> ```shell
> alias maker='pnpm --silent maker'
> ```
>
> That way I can run commands much easier: `maker --version`

## Commands

| Command                                   | Use                                           |
| ----------------------------------------- | --------------------------------------------- |
| `config`                                  | inspect or edit the CLI config                |
| `compile`                                 | compile JSON files                            |
| `validate <files...>`                     | validate any 18xx Maker JSON file or schema   |
| `export [options] [game]`                 | create PDF, PNG and Board 18 files for a game |
| `b18 [options] <game> [version] [author]` | alias of `export --format b18`                |
| `print [options] [game]`                  | alias of `export --format pdf`                |
| `help [command]`                          | get help on any command                       |

As noted above you can always get help on any command:

```shell
# Global help
pnpm maker help

# Individual command help
pnpm maker help compile
pnpm maker help compile schemas
pnpm maker help b18

# ... etc
```

## Export

`export` builds PDF, PNG, SVG and Board 18 files from a game. It needs the built site
(`pnpm build`) and puts the files in `render/<game>`: pdf, png and svg files each in a folder
of that name (`render/<game>/pdf`), the Board 18 box next to them.

```shell
pnpm maker export <game|path.json> --format pdf,png,svg,b18
```

| Option                    | Use                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-f, --format <formats>`  | `pdf`, `png`, `svg` and `b18` separated by commas, default `pdf`                                                                                                       |
| `--docs <pages>`          | only these pages: `map,tiles,cards`, also for their PNGs                                                                                                               |
| `--layouts <layouts>`     | `all`: a sheet for every layout of the cards, tiles and tokens, or `current`                                                                                           |
| `--background <bg>`       | `white` (default) or `transparent`: the background of the map, market, par, revenue and tile manifest PNGs (not of Board 18 images); every other PNG stays transparent |
| `--variation <n>`         | only this map variation, `all` for every one                                                                                                                           |
| `--config <file>`         | a config file on top of `src/config.json` (the settings to change)                                                                                                     |
| `--dpi <dpi>`             | resolution of PNGs, 1 to 300 (the default and the highest), SVGs have none                                                                                             |
| `--card-bleed <units>`    | bleed around each single card PNG in 1/100 inch (12.5 is 1/8 inch), 0 to 50, default 0 (none)                                                                          |
| `-o, --out <folder>`      | the folder that holds the game folders, default `render`                                                                                                               |
| `-j, --jobs <n>`          | files captured at the same time, default 1                                                                                                                             |
| `-a, --all`               | every bundled game                                                                                                                                                     |
| `--b18-version <version>` | the Board 18 version of the box, default `1.0`                                                                                                                         |
| `--b18-author <author>`   | the Board 18 author, default `b18.author` of `maker config`                                                                                                            |
| `-d, --debug`             | serve the site on port 9000 and wait, to look at pages                                                                                                                 |

The `printScale` of a config (the printer correction of the app) is ignored by
exports: they always use the real size.

### Options in the game file

Every option of the table but `--config`, `--out`, `--jobs`, `--all` and
`--debug` can be set in the game file, in its optional top level `exports`
field. The game schema checks it (`pnpm validate`, `maker validate`, and
`export` before it exports a game file).

```json
{
  "exports": {
    "formats": ["pdf", "png", "svg", "b18"],
    "docs": ["map", "cards"],
    "layouts": "all",
    "variation": 1,
    "png": { "dpi": 150 },
    "b18": { "version": "1.2", "author": "Me" }
  }
}
```

| `exports`     | Flag            | Values                                         |
| ------------- | --------------- | ---------------------------------------------- |
| `formats`     | `--format`      | a list of `pdf`, `png`, `svg`, `b18`           |
| `docs`        | `--docs`        | a list of pages (`map`, `tiles`, `cards`, ...) |
| `layouts`     | `--layouts`     | `all` or `current`                             |
| `background`  | `--background`  | `white` or `transparent`                       |
| `variation`   | `--variation`   | a map variation, 0 or more                     |
| `png.dpi`     | `--dpi`         | a whole number from 1 to 300                   |
| `cards.bleed` | `--card-bleed`  | a number from 0 to 50 (1/100 inch)             |
| `b18.version` | `--b18-version` | the Board 18 version                           |
| `b18.author`  | `--b18-author`  | the Board 18 author                            |

The value of an option, lowest to highest: the built in default, the `exports`
of the game file, then your own choice: the flag, the `b18.author` of `maker
config` and the `export.allLayouts` of the config you give with `--config` (for
`layouts`). They are merged option by option, so `--dpi 300` does not drop the
`formats` of the game. A flag has no default of its own: a flag you leave out is
the value of the game file. To go against the game file, give the flag with
another value: `--layouts current` for `"layouts": "all"`, `--variation all` for a `variation`, `--format pdf` for
other `formats`, `--docs` with the pages you want. `b18 <game>` without a
version or author takes them from the game file, then the config. `print` and
`b18` fix the format (pdf, Board 18). An `exports` that does
not pass the schema (a `png.dpi` over 300, an unknown format or page) is an
error with exit code `2`. See the in-app page Export Options
(`src/docs/games/exports.en.md`) for more.

A game is the id of a bundled game or the path of a game file. A file must pass
the game schema (the same check as `validate`) and its name is its id. The game
and the config are given to the page, so a game that is not bundled exports like
one that is.

Exit codes: `0` all files were written, `1` some failed (the others are still
written and the failed ones are listed), `2` the command was used wrong (a game
that does not exist or is not valid, a `--dpi` over 300, the site is not built).
