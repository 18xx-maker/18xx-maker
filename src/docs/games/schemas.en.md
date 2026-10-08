# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Usage

One of the main ways we use schemas is for deprecating features. When we rename
a field the schema has both names: the new one, and the old one marked
`"deprecated": true` with a description that says which name to use. A game
file that still has the old name keeps loading, printing and exporting exactly
as before, and the Problems page lists the old name as deprecated, with the
new name to use. An old name is never removed, so your game files keep working
in every release. If both names are in a file the new one is used.

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
still work, and the page says which name to use instead. The page only reports, your
file is never changed.
Each row that points into the file links to the JSON editor of the edit panel, at the line of the problem. The same list is the Problems tab of the edit panel, where a row opens the JSON editor on its line without leaving the page.

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
