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

Schemas are held in a [separate npm
package](https://www.npmjs.com/package/18xx-schemas) called
[18xx-schemas](https://github.com/18xx-maker/18xx-schemas):

- [game](/schemas/game.schema.json) **WIP** defines a game file
- [tiles](/schemas/tiles.schema.json) defines a tiles file and what the hex definitions in game files look like
- [config](/schemas/config.schema.json) - defines the `defaults.json` format to
  manage the [config
  file](https://github.com/18xx-maker/18xx-maker/blob/master/src/defaults.json)
  for 18xx Maker and it's other tools.
- [theme](/schemas/theme.schema.json) - Schema to define a color theme file
  (maps or companies)

## Validation

To validate all files you can run:

```sh
yarn validate
```

in the root folder of your code checkout. This will validate all relevant json
files in your local checkout.

If you have a need to check files that aren't part of the 18xx Maker code then
you can run the
[@18xx-maker/schemas](https://www.npmjs.com/package/@18xx-maker/schemas) package
directly (either from javascript code, or on the command line) by following it's
[documentation](https://github.com/18xx-maker/schemas)
