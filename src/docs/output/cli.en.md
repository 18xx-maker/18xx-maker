# Command Line

18xx Maker has a command line program, `maker`, that validates game files and
exports PDF, PNG, SVG and Board18 files without opening the app.

## Requirements

The command line is part of the source code, so you need a clone of the
repository and a few tools. The steps are in
[local development](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).
In short:

```shell
git clone https://github.com/18xx-maker/18xx-maker.git
cd 18xx-maker
pnpm install
pnpm exec playwright install chromium --only-shell
pnpm build
```

- Node 24 or newer and [pnpm](https://pnpm.io/installation).
- `pnpm install` installs the dependencies.
- The Chromium browser that Playwright installs is what draws the pages that
  `export` captures.
- `pnpm build` builds the site into `dist/site`, which `export` serves to
  itself. Build again after you update the code.

## Running it

Run it with pnpm or with node:

```shell
pnpm maker help
node ./bin/maker.js help
```

> [!TIP]
> To type `maker` without pnpm's own output, add an alias to your shell:
> `alias maker='pnpm --silent maker'`.

`maker help <command>` explains any command.

## Commands

| Command                                   | Use                                               |
| ----------------------------------------- | ------------------------------------------------- |
| `export [options] [game]`                 | create PDF, PNG, SVG and Board18 files for a game |
| `print [options] [game]`                  | the same as `export --format pdf`                 |
| `b18 [options] <game> [version] [author]` | the same as `export --format b18`                 |
| `validate <files...>`                     | validate any 18xx Maker JSON file or schema       |
| `config`                                  | inspect or edit the options of the command line   |
| `compile`                                 | compile the schemas (for developers)              |
| `help [command]`                          | get help on any command                           |

### export

```shell
pnpm maker export 1889 --format pdf,png,svg,b18
pnpm maker export path/to/my-game.json
pnpm maker export --all
```

A game is the id of a bundled game or the path of a game file. A game file has
to pass the game schema (the same check as `validate`). The files go in
`render/<game>`: the pdf, png and svg files each in a folder of that name, and
the Board18 box next to them. `--out` picks another folder.

The options are the same as the `exports` field of a game file and the _Export
options_ panel of the app. [Export options](/docs/games/exports) has the table of
options and flags, and explains which value wins when the built in default, the
game file and your flags disagree. A flag you leave out keeps the value of the
game file, so to go against it give the flag another value, for example
`--layouts current`. The flags that are only about how the command runs are
`--config <file>` (a config file, see the [Config Panel](/docs/config)),
`--out <folder>`, `--jobs <n>` (files captured at the same time),
`--all` (every bundled game) and `--debug` (serve the site on port 9000 and
wait, to look at the pages).

Exports ignore the print scale of a config: they always have the real size.
The `config` of a game file only applies when `allowGameConfig` is set in the
`--config` file or in `src/config.json`.

### print and b18

`print` is `export --format pdf` and `b18` is `export --format b18`. `b18 <game>
[version] [author]` takes the version and author from the game file, then from
`maker config`. See [Board18 output](/docs/output/b18).

### validate

```shell
pnpm maker validate my-game.json "src/data/games/*.json"
```

Checks every file (globs work) against the schema that fits it (see [JSON
schemas](/docs/games/schemas)) and prints each mistake with its place in the
file.

### config

`maker config` lists the options of the command line, `maker config file` prints
the file they are stored in, and `maker config get <key>` and `maker config set
<key> [value]` read and write one. Leaving out the value removes the option.
There is one option: `b18.author`, the author name of Board18 boxes.

### compile

`maker compile` rebuilds the generated `tiles.defs.json` from the tile schema
sources. It is a developer command: you only need it when you change the
schemas, and then `make` also copies them to `public/schemas`.

## Exit codes

| Code | Meaning                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | everything worked                                                                                                                                                    |
| `1`  | `export`: some files failed (the others are still written and the failed ones are listed), `validate`: a file is not valid                                           |
| `2`  | the command was used wrong: a game that does not exist or is not valid, a value out of range such as a `--dpi` over 300, an unknown option, or the site is not built |
