# 18xx Maker

[![chat](https://img.shields.io/discord/1302895372749770752?logo=discord&logoColor=%23fff&color=%235865F2)](https://discord.gg/gcYvAjYYfw)
[![build](https://img.shields.io/github/check-runs/18xx-maker/18xx-maker/main?logo=github&logoColor=%23fff&label=build)](https://github.com/18xx-maker/18xx-maker/actions/workflows/test.yml?query=branch%3Amain)
[![coveralls](https://img.shields.io/coverallsCoverage/github/18xx-maker/18xx-maker?logo=coveralls&logoColor=%23fff)](https://coveralls.io/github/18xx-maker/18xx-maker)
[![license](https://img.shields.io/github/license/18xx-maker/18xx-maker?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNyAyMGwxMCAwIi8%2BPHBhdGggZD0iTTYgNmw2IC0xbDYgMSIvPjxwYXRoIGQ9Ik0xMiAzbDAgMTciLz48cGF0aCBkPSJNOSAxMmwtMyAtNmwtMyA2YTMgMyAwIDAgMCA2IDAiLz48cGF0aCBkPSJNMjEgMTJsLTMgLTZsLTMgNmEzIDMgMCAwIDAgNiAwIi8%2BPC9zdmc%2B&logoColor=%23fff&color=%23750014)](https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme)

[![app](https://img.shields.io/github/v/release/18xx-maker/18xx-maker?include_prereleases&sort=semver&display_name=tag&logo=electron&logoColor=%23fff&label=app&color=%2347848F)](https://github.com/18xx-maker/18xx-maker/releases)
[![site](https://img.shields.io/netlify/725d9a0f-9db9-457c-a8d0-6bf78140020b?logo=netlify&logoColor=%23fff&label=site)](https://18xx-maker.com)
[![storybook](https://img.shields.io/netlify/3ccc6fb4-1994-4479-81ea-8cd0a61c0c21?logo=netlify&logoColor=%23fff&label=storybook)](https://storybook.18xx-maker.com)
[![docker](https://img.shields.io/github/v/release/18xx-maker/18xx-maker?include_prereleases&sort=semver&display_name=tag&logo=docker&logoColor=%23fff&label=docker&color=%232496ED)](https://github.com/orgs/18xx-maker/packages?ecosystem=container)

This app can take [18xx](https://en.wikipedia.org/wiki/18XX) game definitions
written in json, display them, and render them for printing. The original intent
of this site was for personal PnP projects, but the purpose has shifted over
time to prototyping new games.

This project is written in [React](https://react.dev/) with
[Redux](https://redux.js.org/) and [React Router](https://reactrouter.com/). It
uses [Vite](https://vite.dev/) as a build framework and
[Vitest](https://vitest.dev/) as a testing framework. The application version is
created using [Electron](https://www.electronjs.org/). The ui was made with
[Material-UI](https://mui.com/material-ui/) and developed with
[Storybook](https://storybook.js.org/). It uses
[Playwright](https://playwright.dev/) for both testing and running a headlines
chrome in scripts.

This software is released under the
[MIT](https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme) open
source software license. The code is available on
[GitHub](https://github.com). We use GitHub actions, releases, and packages to
handle CI, app hosting, and docker image hosting. We use
[Netlify](https://netlify.com) to build and serve the
[website](https://18xx-maker.com) and the
[storybook](https://storybook.18xx-maker.com).

## License

The code of this project is licensed under the [MIT
License](https://github.com/18xx-maker/18xx-maker/blob/main/LICENSE) but the
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

## [Docker](https://github.com/orgs/18xx-maker/packages?ecosystem=container)

We create two docker images of the [production
site](https://github.com/18xx-maker/18xx-maker/pkgs/container/site) and a
[development
build](https://github.com/18xx-maker/18xx-maker/pkgs/container/develop). You can
read more about how to use them in the [developing
documentation](https://18xx-maker.com/docs/developing).

## Donation

I've been asked about donation buttons; if you find this software useful to you
and would like to donate money towards its development you can do so via
[paypal](https://paypal.me/kelsin), [square cash](https://cash.me/$kelsin), or
[venmo](https://account.venmo.com/u/kelsin13).

## Development

### Scripts

These are the package.json scripts that you should know:

```shell
# Start the development versions of the site, app, or storybook site:
pnpm start
pnpm start:app
pnpm start:sb

# CLI to print a game and create a b18 box
pnpm print
pnpm b18
```

The following are all run for you on relevant files as part of git commit hooks,
and in CI. They are here if you want or need to run them manually:

```shell
# Run the tests in watch mode
pnpm test

# Run all fixing linters
pnpm fix

# Run schema validation on all data json files:
pnpm validate

# Optimize SVGs
pnpm svgo
```

Finally there are the commands to preview and build the production versions of
the site, app and storybook site:

```shell
# Preview the production builds
pnpm preview
pnpm preview:app

# Build the production site, electron app, or storybook site:
pnpm build
pnpm build:app
pnpm build:sb
```

### File Layout

At a high level the folder structure looks like:

```shell
.
├── bin             # CLI scripts
├── dist            # All built sites / apps end up in here
│   ├── app         # The built electron apps
│   ├── main        # The built esbuild for the main electron process
│   ├── preload     # The built esbuild for the preload file
│   ├── site        # The built esbuild for the main 18xx Maker site
│   ├── sb          # The built esbuild for the storybook site
│   └── renderer    # The built esbuild for the preload file
├── docker          # Stuff only related to docker builds
├── electron        # Electron related src files
│   ├── assets      # Files that we need when building electorn
│   ├── main        # The src for the electron main process
│   └── preload     # The preload file injected into the render process
├── public          # Files that are just served statically
├── src
│   ├── atoms
│   │   └── shapes
│   ├── cards
│   ├── config
│   ├── context
│   ├── data        # Data files that are built into the app (games, icons, logos, etc)
│   ├── games
│   ├── hooks       # React hooks
│   ├── locales     # Localization files
│   ├── map
│   ├── market
│   ├── nav
│   ├── pages       # Top level routing components
│   ├── render
│   ├── schemas     # JSON schemas for all 18xx Maker data files
│   ├── state       # Redux state store related files
│   ├── tilesheet
│   ├── tokens
│   └── util        # Utility helpers
└── tests           # Any e2e testing or test helper files
```
