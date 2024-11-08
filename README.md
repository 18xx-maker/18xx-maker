# 18xx Maker

![build](https://img.shields.io/github/actions/workflow/status/18xx-maker/18xx-maker/pr.yml)
![version](https://img.shields.io/github/v/release/18xx-maker/18xx-maker?sort=semver)
![downloads](https://img.shields.io/github/downloads/18xx-maker/18xx-maker/total)
![license](https://img.shields.io/github/license/18xx-maker/18xx-maker)

This app can take [18xx](https://en.wikipedia.org/wiki/18XX) game definitions
written in json, display them, and render them for printing. The original intent
of this site was for personal PnP projects, but the purpose has shifted over
time to prototyping new games.

This project was bootstrapped with [Create React
App](https://github.com/facebookincubator/create-react-app). The application
version is created using [Electron](https://www.electronjs.org/). The ui was
made with [Material-UI](https://material-ui.com/).

## License

The code of this project is licensed under the [MIT License](LICENSE) but the
games contained within are not covered by this. The games are presented with no
license from 18xx-Maker with the permission of the publisher/designers. They
have given us permission to include their game in this repo so that you can make
print and play copies for your own personal use. If you need to inquire about
the license for a particular game you need to get in contact with the publisher
and/or designer.

## Chat

We have a [discord for 18xx-Maker](https://discord.gg/gcYvAjYYfw). Please use it
for any development chat or support!

## Usage and Documentation

Please check out the [documentation](https://18xx-maker.com/docs/) for
information about how to use this app to prototype your own 18xx games.

## Donation

I've been asked about donation buttons; if you find this software useful to you
and would like to donate money towards its development you can do so via
[paypal](https://paypal.me/kelsin) or [square cash](https://cash.me/$kelsin).

## Schemas

### CLI Usage

Install this package gives you a `18xx-schemas` binary that takes in any number
of globs and validates each file it can find. If a file doesn't exist it just
ignores it. It then pretty prints the validation output using ansi colors on the
terminal.

```shell
# Validate some files
18xx-schemas games/*.json tiles/**/*.json config.json

# Display all options
18xx-schemas -h

# Output version
18xx-schemas -v
```

Be warned that if you pass a json that doesn't conform to any of the 18xx-maker
json schemas it will be validated against the tiles schema.

From this repo you can run this with `yarn schemas` like the following:

```shell
# Display all options
yarn schemas -h
```
