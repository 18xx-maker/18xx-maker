# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Current Schemas

* [config](/schemas/config.schema.json) - Schema to define the `config.json`
  format to manage the [config
  file](https://github.com/kelsin/18xx/blob/master/src/config.json) for this
  tool.
* [tiles](/schemas/tiles.schema.json) - **WIP** - Schema to define a tiles file
* [game](/schemas/game.schema.json) - **WIP** - Schema to define a game file
* [theme](/schemas/theme.schema.json) - Schema to define a color theme file
* [companies](/schemas/companies.schema.json) - Schema to define a companies color theme file

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate the schemas
themselves and then all files that use them.
