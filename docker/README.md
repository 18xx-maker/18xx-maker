# 18xx Maker

[![chat](https://img.shields.io/discord/1302895372749770752?logo=discord&logoColor=%23fff&color=%235865F2)](https://discord.gg/gcYvAjYYfw)

[![license](https://img.shields.io/github/license/18xx-maker/18xx-maker?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNyAyMGwxMCAwIi8%2BPHBhdGggZD0iTTYgNmw2IC0xbDYgMSIvPjxwYXRoIGQ9Ik0xMiAzbDAgMTciLz48cGF0aCBkPSJNOSAxMmwtMyAtNmwtMyA2YTMgMyAwIDAgMCA2IDAiLz48cGF0aCBkPSJNMjEgMTJsLTMgLTZsLTMgNmEzIDMgMCAwIDAgNiAwIi8%2BPC9zdmc%2B&logoColor=%23fff&color=%23750014)](https://github.com/18xx-maker/18xx-maker?tab=MIT-1-ov-file#readme)

[![build](https://img.shields.io/github/check-runs/18xx-maker/18xx-maker/main?logo=github&logoColor=%23fff&label=build)](https://github.com/18xx-maker/18xx-maker)

[![docker](https://img.shields.io/docker/v/kelsin/18xx/latest?logo=docker&logoColor=%23fff&color=%232496ED&label=docker)](https://hub.docker.com/r/kelsin/18xx/tags)

These are the docker images published for [18xx Maker](https://18xx-maker.com)
from it's [github](https://github.com/18xx-maker/18xx-maker) repository.

## Tags

### [kelsin/18xx:latest](https://hub.docker.com/r/kelsin/18xx/tags?name=latest)

This image is an [nginx](https://hub.docker.com/_/nginx) based image with a
built version of the production 18xx Maker site running in it.

You can run it locally with a command like:

```shell
docker run -it --rm -p 3000:80 --name 18xx-maker kelsin/18xx:latest
```

This image is also published with the git tag as the label to save previous
versions of the build.

### [kelsin/18xx:develop](https://hub.docker.com/r/kelsin/18xx/tags?name=develop)

This image is an [node](https://hub.docker.com/_/node) based image with the
development version of the site running in it.

You can run it locally with a command like:

```shell
docker run -it --rm -p 3000:3000 --name 18xx-maker-develop kelsin/18xx:develop
```

The image is ready to run any yarn command. You can mount a volume to `/18xx` in
order to save your work across sessions.

## More Information

More infomation can be found on the main [18xx Maker
website](https://18xx-maker.com) or it's
[documentation](https://18xx-maker.com/docs/developing).

## Chat

We have a [discord for 18xx-Maker](https://discord.gg/gcYvAjYYfw). Please use it
for any development chat or support!

## Donation

I've been asked about donation buttons; if you find this software useful to you
and would like to donate money towards its development you can do so via
[paypal](https://paypal.me/kelsin), [square cash](https://cash.me/$kelsin), or
[venmo](https://account.venmo.com/u/kelsin13).
