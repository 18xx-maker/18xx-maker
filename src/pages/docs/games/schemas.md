# JSON Schemas

Our schemas are defined in [JSON Schema](https://json-schema.org/) version
draft-07.

## Current Schemas

Schemas are held in a [separate npm
package](https://www.npmjs.com/package/18xx-schemas) called
[18xx-schemas](https://github.com/18xx-maker/18xx-schemas):

* [tiles](/schemas/tiles.schema.json) **WIP** Schema to define a tiles file
* [game](/schemas/game.schema.json) **WIP** Schema to define a game file
* [config](/schemas/config.schema.json) - Schema to define the `defaults.json`
  format to manage the [config
  file](https://github.com/18xx-maker/18xx-maker/blob/master/src/defaults.json) for this
  tool.
* [theme](/schemas/theme.schema.json) - Schema to define a color theme file
  (maps or companies)

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate all relevant json
files in your local checkout.
