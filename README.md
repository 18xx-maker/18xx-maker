# 18xx Maker

[![Build Status](https://travis-ci.org/18xx-maker/18xx-maker.svg?branch=master)](https://travis-ci.org/18xx-maker/18xx-maker)

This is a small pet project to help layout and print
[18xx](https://en.wikipedia.org/wiki/18XX) games.

**Important Note**: A small version of the site is up and running on
[www.18xx-maker.com](https://www.18xx-maker.com). This version only has a few games on
it. If you want to see all games included in the data files you'll need to
download the app and run it yourself (or run the public docker image). If any
designers/publishers would like to add their games to this public site just let
me know!

This project was bootstrapped with [Create React
App](https://github.com/facebookincubator/create-react-app).

## Donation

I've been asked about donation buttons; if you find this software useful to you
and would like to donate money towards its development you can do so via
[paypal](https://paypal.me/kelsin) or [square cash](https://cash.me/$kelsin).

## Deprecations and Breaks

I try to keep the tool as backwards compatible as possible, but I'm allowing
breaking changes until I decide that version 1.0 is ready for release. I will
try to list major ones here. Please open issues for any breaking changes that
aren't listed here so I can either fix, or add it.

* Way to define special tokens has changed, take a look at the atoms page to see
  examples of the new ones.
* If you used the new map Border features during the first three days after
  launch... I broke it already. Moving to a more full featured coordinate
  system.
* `extraTokens` has been renamed to `marketTokens` (still defaults to
  3). `extraHomeTokens` has been renamed to `extraStationTokens`. This is for
  clarity, I'm sorry for any inconvience, but the old names were extremely
  confusing for new users.
* The old method for defining a company color with the `token` field has been
  removed. Please use `"color": "black"` (for example) or define an actual token
  object if you want to set type and an array of colors for your company tokens.
* A lot of features dealing with logos and svgs won't work if you defined your
  cities using `colors` and `labels` in the `companies` array. In order to put a
  company in a city please just provide the companies abbrev in an array of
  companies. Otherwise it will make a label with exactly what you specify
  (allowing any text / colors / etc to be used in city nodes).

## Usage

Please check out the [docs](https://www.18xx-maker.com/docs/running) for how to run
the site locally.

### Printing

Please check out the [docs](https://www.18xx-maker.com/docs/pdf) for how to print
pdf's from the command line.

### Board18

Please check out the [docs](https://www.18xx-maker.com/docs/b18) for information on
how to output a full board18 game box .zip file from the command line.

## Developing

### Running the site

Please check out the [docs](https://www.18xx-maker.com/docs/running) for
information on how to run the site locally to make changes.

### Adding a game

1. Copy one of the game files you feel should be closest to the game you're
   entering from the [src/data/games](src/data/games) folder. Rename it and edit
   it as much as needed. Please put it in the `public` folder if you would like
   the game to appear on the public site.

2. Before opening a PR please run `yarn validate` and correct any errors.

## Docker

Please check out the [docs](https://www.18xx-maker.com/docs/running#using-docker) for
information on how to run the site locally via Docker.
