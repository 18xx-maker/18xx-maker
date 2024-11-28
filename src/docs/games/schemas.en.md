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

- [companies](/schemas/companies.schema.json) defines the companies files for
  overriding companies
- [publishers](/schemas/publishers.schemas.json) defines the publishers file
- [game](/schemas/game.schema.json) defines a game file - _this is currently a
  work in progress and isn't complete_
- [tiles](/schemas/tiles.schema.json) defines a tiles file and what the hex definitions in game files look like
- [config](/schemas/config.schema.json) - defines the `defaults.json` format to
  manage the [config
  file](https://github.com/18xx-maker/18xx-maker/blob/master/src/defaults.json)
  for 18xx Maker and it's other tools.
- [theme](/schemas/theme.schema.json) - Schema to define a color theme file
  (maps or companies)

The game and tiles schemas both reference
[tiles.defs.json](/schemas/tiles.defs.json) which is shared and defines all of
the json that can go into a map/tile hex.

## Validation

To validate all files you can run:

```bash
pnpm validate
```

in the root folder of your code checkout. This will validate all relevant json
files including the schemas themselves.
