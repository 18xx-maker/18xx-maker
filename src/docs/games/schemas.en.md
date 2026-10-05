# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Usage

One of the main ways we use schemas is for deprecating features. When changing a
feature we'll commonly make the old syntax not validate. That way it becomes
obvious where the uses of the old feature exist. Then on the next release of a
major (breaking) version number we'll remove the code that supports the old way.

In this way game files will continue to work but won't validate. Hopefully users
can fix their files and then eventually upgrade to the next major version easily
as long as their game files validate.

## Current Schemas

Schemas are in the
[src/schemas](https://github.com/18xx-maker/18xx-maker/tree/main/src/schemas)
directory of the source repository.

- [companies](https://18xx-maker.com/schemas/companies.schema.json) defines the companies files for
  overriding companies
- [publishers](https://18xx-maker.com/schemas/publishers.schema.json) defines the publishers file
- [game](https://18xx-maker.com/schemas/game.schema.json) defines a game file
- [tiles](https://18xx-maker.com/schemas/tiles.schema.json) defines a tiles file and what the hex definitions in game files look like
- [config](https://18xx-maker.com/schemas/config.schema.json) - defines the `defaults.json` format to
  manage the [config
  file](https://github.com/18xx-maker/18xx-maker/blob/main/src/defaults.json)
  for 18xx Maker and its other tools.
- [theme](https://18xx-maker.com/schemas/theme.schema.json) - Schema to define a color theme file
  (maps or companies)

The game and tiles schemas both reference
[tiles.defs.json](https://18xx-maker.com/schemas/tiles.defs.json) which is shared and defines all of
the json that can go into a map/tile hex.

## Export options

A game file can have an `exports` field with the default options for exporting
the game (formats, pages, resolution, Board18 version and author). It is
described in the game schema and in [Export options](/docs/games/exports), and
a value that is not valid, like a resolution over 300 dpi, fails validation.

## Problems page

When you open a game its file is checked against the game schema in the
background. If something is wrong a Problems entry appears in the game menu, with the number of problems. It opens a list with where each problem
is, what is wrong and how to fix it: unknown fields (a typo, or a field that was
renamed or removed), values of the wrong type, values that are not allowed, and
required fields that are missing. Fields that are deprecated are listed too, they
still work but will be removed in a future version. The page only reports, your
file is never changed.

## Validation

To validate all files you can run:

```bash
pnpm validate
```

in the root folder of your code checkout. This will validate all relevant json
files including the schemas themselves. To validate your own game file:

```bash
pnpm maker validate my-game.json
```
