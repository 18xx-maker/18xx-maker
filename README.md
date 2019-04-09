# Kelsin's 18xx Prototyping React Library

This is a small pet project to help layout and print
[18xx](https://en.wikipedia.org/wiki/18XX) games.

**Important Note**: A small version of the site is up and running on
[18xx.kelsin.net](https://18xx.kelsin.net). This version only has a few games on
it. If you want to see all games included in the data files you'll need to
download the app and run it yourself (or run the public docker image). If any
designers/publishers would like to add their games to this public site just let
me know!

This project was bootstrapped with [Create React
App](https://github.com/facebookincubator/create-react-app).

## Docker

If you have docker installed (or available) you can run a [public docker
image](https://hub.docker.com/r/kelsin/18xx) that includes all games. Run the
following command and the site should be available at http://localhost (you
might need to edit the port depending on your OS and other running apps):

```sh
docker run -it --rm -p 80:80 kelsin/18xx
```

More documentation about this will be coming soon.

## Usage

Download the app, and then (from the folder that you downloaded into) run the
following:

```sh
# Install the dependencies
yarn

# Run the app
yarn start
```

or if you don't want to use [yarn](https://yarnpkg.com/en/):

```sh
# Install the dependencies
npm install

# Run the app
npm start
```

### Adding a game

1. Copy one of the game files you feel should be closest to the game you're
   entering from the [src/data/games](src/data/games) folder. Rename it and edit it as
   much as needed.

2. In order for this new game to show up in the UI, please add it to the
   exported object in the [src/data/games/index.js](src/data/games/index.js)
   file.

### Adding tiles

1. Edit [src/data/tiles.js](src/data/tiles.js) and add your tile.

2. If your tile is a variant you can include a `|` in the name. Everything
   before the `|` will be shown on the tile, but anything after won't.

### Editing simple options

Until more things get added to the UI, simple options can be edited in the
[src/data/index.js](src/data/index.js) file.

## Changes

### Terrain

Using `water` and `mountain` for map hexes is now deprecated. The new way is to
use `terrain` like this:

``` js
{ terrain: [{ type: "mountain", cost: "$60" }] }
```

Right now valid types are `mountain`, `water`, `river`, `stream`, `cactus`, and
`swamp`. More might be added in the future. You can also add a `size` attribute
as `tiny` if you want it small. If you want to enlarge the icon you can pass in
`medium` or `large`.

### OffBoardTrack

I finally made the offboard track arrows just another type of track. So instead
of this:

``` js
{ offBoardTrack: [{side:5}] }
```

you can:

``` js
{ track: [{side:5, type:"offboard"}] }
```

For now `offBoardTrack` is deprecated, the old syntax will work until the next
major version release.
