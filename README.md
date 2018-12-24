# Kelsin's 18xx Prototyping React Library

This is a small pet project to help layout and print
[18xx](https://en.wikipedia.org/wiki/18XX) games.

My current version is always running at
[https://18xx.kelsin.net](https://18xx.kelsin.net).

This project was bootstrapped with [Create React
App](https://github.com/facebookincubator/create-react-app).

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
