# 18xx Maker

[![analytics](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fanalytics.18xx-maker.com%2Fvisitors&query=%24.results%5B0%5D.metrics%5B0%5D&suffix=%20UV&logo=plausibleanalytics&logoColor=%23fff&label=analytics&color=%235850EC)](https://analytics.18xx-maker.com/)
[![build](https://img.shields.io/github/check-runs/18xx-maker/18xx-maker/main?logo=github&logoColor=%23fff&label=build)](https://github.com/18xx-maker/18xx-maker/actions/workflows/test.yml?query=branch%3Amain)
[![coveralls](https://img.shields.io/coverallsCoverage/github/18xx-maker/18xx-maker?logo=coveralls&logoColor=%23fff)](https://coveralls.io/github/18xx-maker/18xx-maker)
[![chat](https://img.shields.io/discord/1302895372749770752?logo=discord&logoColor=%23fff&color=%235865F2)](https://discord.gg/gcYvAjYYfw)
[![license](https://img.shields.io/github/license/18xx-maker/18xx-maker?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNyAyMGwxMCAwIi8%2BPHBhdGggZD0iTTYgNmw2IC0xbDYgMSIvPjxwYXRoIGQ9Ik0xMiAzbDAgMTciLz48cGF0aCBkPSJNOSAxMmwtMyAtNmwtMyA2YTMgMyAwIDAgMCA2IDAiLz48cGF0aCBkPSJNMjEgMTJsLTMgLTZsLTMgNmEzIDMgMCAwIDAgNiAwIi8%2BPC9zdmc%2B&logoColor=%23fff&color=%23750014)](https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme)

[![app](https://img.shields.io/github/v/release/18xx-maker/18xx-maker?include_prereleases&sort=semver&display_name=tag&logo=electron&logoColor=%23fff&label=app&color=%2347848F)](https://github.com/18xx-maker/18xx-maker/releases)
[![site](https://img.shields.io/netlify/725d9a0f-9db9-457c-a8d0-6bf78140020b?logo=netlify&logoColor=%23fff&label=site)](https://18xx-maker.com)
[![storybook](https://img.shields.io/netlify/3ccc6fb4-1994-4479-81ea-8cd0a61c0c21?logo=netlify&logoColor=%23fff&label=storybook)](https://storybook.18xx-maker.com)
[![docker](https://img.shields.io/github/v/release/18xx-maker/18xx-maker?include_prereleases&sort=semver&display_name=tag&logo=docker&logoColor=%23fff&label=docker&color=%232496ED)](https://github.com/orgs/18xx-maker/packages?ecosystem=container)

This app can take [18xx](https://en.wikipedia.org/wiki/18XX) game definitions
written in json, display them, and render them for printing. The original intent
of this site was for personal PnP projects, but the purpose has shifted over
time to prototyping new games.

This software is released under the
[MIT](https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme) open
source software license. The code is available on
[GitHub](https://github.com). We use GitHub actions, releases, and packages to
handle CI, app hosting, and docker image hosting. We use
[Netlify](https://netlify.com) to build and serve the
[website](https://18xx-maker.com) and the
[storybook](https://storybook.18xx-maker.com).

This project is written in [React](https://react.dev/) with
[Redux](https://redux.js.org/) and [React Router](https://reactrouter.com/). It
uses [Vite](https://vite.dev/) as a build framework and
[Vitest](https://vitest.dev/) as a testing framework. The application version is
created using [Electron](https://www.electronjs.org/). The ui was made with
[Material-UI](https://mui.com/material-ui/) and developed with
[Storybook](https://storybook.js.org/). It uses
[Playwright](https://playwright.dev/) for both testing and running a headlines
chrome in scripts.

## Discord

We have a [discord for 18xx-Maker](https://discord.gg/gcYvAjYYfw). Please use it
for any development chat or support!

## License

The code of this project is licensed under the [MIT
License](https://github.com/18xx-maker/18xx-maker/blob/main/LICENSE) but the
games contained within are not covered by this. The games are presented with no
license from 18xx Maker with the permission of the publishers and/or designers.

> [!IMPORTANT]
> Do not use this app to print games that you don't have a license to
> print. Please support our 18xx designers, developers, and publishers.

All games included in this repository are included with permission from the
publisher and/or designer. You can make print and play copies for your own
personal use. Please thank them for their support of Print and Play! If you need
to inquire about the license for a game you should contact the publisher and/or
designer.

## Documentation

Documentation for how to use 18xx Maker to print or develop new games is
available on the [main site](https://18xx-maker.com/docs).

## Development

Please check out
[DEVELOPMENT.md](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
for information on developing and contributing to this application! The
[discord](https://discord.gg/gcYvAjYYfw) is also a great place to come if you
need advice or help.

## Donation

I've been asked about donation buttons; if you find this software useful to you
and would like to donate money towards its development you can do so via
[paypal](https://paypal.me/kelsin), [square cash](https://cash.me/$kelsin), or
[venmo](https://account.venmo.com/u/kelsin13).
