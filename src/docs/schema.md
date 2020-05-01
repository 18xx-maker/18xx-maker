# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Current Schemas

Schemas for game files and tile files are held in a [separate npm
package](https://www.npmjs.com/package/18xx-schemas) called
[18xx-schemas](https://github.com/18xx-maker/18xx-schemas):

* [tiles](https://github.com/18xx-maker/18xx-schemas/blob/master/schemas/tiles.schema.json) -
  **WIP** - Schema to define a tiles file
* [game](https://github.com/18xx-maker/18xx-schemas/blob/master/schemas/game.schema.json) -
  **WIP** - Schema to define a game file

Schemas for 18xx-maker config and themes are contained in this project:

* [config](/schemas/config.schema.json) - Schema to define the `defaults.json`
  format to manage the [config
  file](https://github.com/kelsin/18xx/blob/master/src/defaults.json) for this
  tool.
* [theme](/schemas/theme.schema.json) - Schema to define a color theme file
* [companies](/schemas/companies.schema.json) - Schema to define a companies
  color theme file

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate the schemas
themselves and then all files that use them.
