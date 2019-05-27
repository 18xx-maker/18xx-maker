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

## Donation

I've been asked about donation buttons, if you find this software usefull to you
and would like to donate money towards it's development you can do so via
[paypal](https://paypal.me/kelsin) or [square cash](https://cash.me/$kelsin).

## Usage

This node app uses `yarn` as it's package managing. Installing with `npm` is not
supported as I can't guaruntee proper package versions.

First install [node.js](https://nodejs.org/en/) and
[yarn](https://yarnpkg.com/en/) for your operating system. I recommend using the
LTS version of node (current 10.x). The version I'm currently developing with
will always be listed in
[.node-version](https://github.com/kelsin/18xx/blob/master/.node-version).

Download the app (either using git or just downloading the zip file from
github), and then (from the folder that you downloaded into) run the following:

```sh
# Install the dependencies
yarn

# Run the app
yarn start
```

### Printing

Please check out the [docs](https://18xx.kelsin.net/docs/pdf) for how to print
pdf's from the command line.

### Board18

Please check out the [docs](https://18xx.kelsin.net/docs/b18) for information on
how to output a full board18 game box .zip file from the command line.

## Developing

### Adding a game

1. Copy one of the game files you feel should be closest to the game you're
   entering from the [src/data/games](src/data/games) folder. Rename it and edit it as
   much as needed.

2. In order for this new game to show up in the UI, please add it to the
   exported object in the [src/data/games/index.js](src/data/games/index.js)
   file.

3. Before opening a PR please run `yarn validate` and correct any errors.

## Docker

If you have docker installed (or available) you can run a [public docker
image](https://hub.docker.com/r/kelsin/18xx) that includes all games. Run the
following command and the site should be available at http://localhost (you
might need to edit the port depending on your OS and other running apps):

```sh
docker run -it --rm -p 80:80 --name 18xx kelsin/18xx
```

### Persistant Docker Volume

If you want to use docker to hack on the site, you can use a docker volume to
keep a persistant image of the game code. Knowledge of how to manage docker
volumes is important to use this properly.

```sh
docker run -it --rm -p 3000:3000 --name 18xx-develop -v 18xx:/home/18xx kelsin/18xx:develop
```

This will run the react-development server that will live update if you edit
files, and store anything edited (starting with the current code) on the volume
named `18xx`.
