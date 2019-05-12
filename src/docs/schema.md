# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Current Schemas

* [config](/schemas/config.schema.json) - Schema to define the `config.json`
  format to manage the [config
  file](https://github.com/kelsin/18xx/blob/master/src/config.json) for this
  tool.
* [theme](/schemas/theme.schema.json) - Schema to define a theme file
* [companies](/schemas/companies.schema.json) - Schema to define a companies file
* [tiles](/schemas/tiles.schema.json) - Schema to define a tiles file **WIP**

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate the schemas
themselves and then all files that use them.

## Planned Schemas

* tiles - Schema to define what can go into a hex tile. This will be used by
  game files to define the map, and the game-agnostic tile files with all of the
  tile definitions.
* game - Schema to define a whole 18xx game (references tile schema above)
