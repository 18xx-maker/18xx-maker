# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Current Schemas

* [companies](/schemas/companies.schema.json) - Schema to define a companies file
* [config](/schemas/config.schema.json) - Schema to define the `config.json`
  format to manage the [config
  file](https://github.com/kelsin/18xx/blob/master/src/config.json) for this
  tool.
* [game](/schemas/game.schema.json) - Schema to define a game file **WIP**
* [tiles](/schemas/tiles.schema.json) - Schema to define a tiles file **WIP**
* [theme](/schemas/theme.schema.json) - Schema to define a theme file

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate the schemas
themselves and then all files that use them.
