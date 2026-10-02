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
| `b18 [options] <game> <version> [author]` | alias of `export --format b18`                |
| `print [options] [game]`                  | alias of `export --format pdf --paginated`    |
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

`export` builds PDF, PNG and Board 18 files from a game. It needs the built site
(`pnpm build`) and puts the files in `render/<game>`.

```shell
pnpm maker export <game|path.json> --format pdf,png,b18
```

| Option                    | Use                                                                |
| ------------------------- | ------------------------------------------------------------------ |
| `-f, --format <formats>`  | `pdf`, `png` and `b18` separated by commas, default `pdf`          |
| `--docs <pages>`          | only these pages: `map,tiles,cards`, also for their PNGs           |
| `--layouts all`           | a sheet for every layout of the cards, tiles and tokens            |
| `--paginated`             | also the paginated PDFs (`print` always has them)                  |
| `--variation <n>`         | only this map variation                                            |
| `--config <file>`         | a config file on top of `src/config.json` (the settings to change) |
| `--dpi <dpi>`             | resolution of PNGs, 1 to 300 (the default and the highest)         |
| `-o, --out <folder>`      | the folder that holds the game folders, default `render`           |
| `-j, --jobs <n>`          | files captured at the same time, default 1                         |
| `-a, --all`               | every bundled game                                                 |
| `--b18-version <version>` | the Board 18 version of the box, default `1.0`                     |
| `--b18-author <author>`   | the Board 18 author, default `b18.author` of `maker config`        |
| `-d, --debug`             | serve the site on port 9000 and wait, to look at pages             |

A game is the id of a bundled game or the path of a game file. A file must pass
the game schema (the same check as `validate`) and its name is its id. The game
and the config are given to the page, so a game that is not bundled exports like
one that is.

Exit codes: `0` all files were written, `1` some failed (the others are still
written and the failed ones are listed), `2` the command was used wrong (a game
that does not exist or is not valid, a `--dpi` over 300, the site is not built).
