# Documentation

This is a collection of docs that talk about how to use and extend this tool.

## Goals

* Create a [json schema](/docs/schema) that defines a full 18xx game
* Disconnect tiles from individual games so the definition of a tile is kept
  separate and every game doesn't need to define tile 7 (for example).
* Disconnect the look of an 18xx game from the definition file. While we will
  support overriding options in game files, we will also support ignoring those
  options for those that want full control over how they print their game.
* Built as a web app to allow for a [publicly hosted
  version](https://18xx.kelsin.net) as well as easy editor support and fast
  iteration when creating new tiles and game files.
* Provide lots of output support:
  * [PDF Output](/docs/pdf)
  * [Board18 Zip file output](/docs/b18)
  * SVG Output - *Not implemented Yet*

## Links

* [Github](https://github.com/kelsin/18xx) - Source Code
* [Hosted Version](https://18xx.kelsin.net) - Publicly hosted version
* [Board18](https://dev2.board18.org/) - Remote play tool for 18xx style games
