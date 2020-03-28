# Tokens

18xx Maker has a lot of custom abilities that you can set on the [config
page](/config) for tokens. This page should help explain them.

## Definitions

This tool calls tokens "Market Tokens" or "Station Tokens". Market tokens are
used on stock markets, par charts and race tracks (to track revenue). Station
tokens are used for stations on the map.

## Game File Options

In a game file in the main `info` field you can put two fields to define how
many tokens to print for companies.

`marketTokens` defines how many market tokens to print and defaults to 3. So in
a standard game with a par chart you don't need to define this field. You can
also define this field on a companies definition to override it's value only for
that company.

`extraStationTokens` defines how many station tokens to print for each company
in addition to any defined on the company itself. You can also define this field
on a company to override it's value only for that company.

## Tool Config Options

You can set the size of each type of token in the tool. We default to 0.5 inches
for market tokens and 0.375 inches for station tokens. Hole punches for these
sizes are relativly easy to find and the resulting stickers fit nicely on the
15mm and 12mm tokens from [Rails on Boards](https://www.railsonboards.com/).

If you set the token layout to GSP than it sets the sizes to all 0.5 inches and
lays out tokens ready for printing on [these
sheets](https://www.amazon.com/Round-Circle-Labels-White-Printer/dp/B0731PSJLR/).

You can also tell the tool how many of the market tokens you want reverse images
for. The three settings are none, 1 or all. I prefer having reverse token sides
for all market tokens but preferences vary.

Please remember that tokens on the token sheet all have a little bit of bleed on
them to prevent cutting errors. When putting tokens on maps they are exact, but
they will print with circles larger than what you set in the tool on the token
sheet. This is expected behavior.

## PnP Advice

I use tokens from [Rails on Boards](https://www.railsonboards.com/) (12mm and
15mm tokens and cylinders) and use a [3/8
inch](https://www.amazon.com/gp/product/B0090JVDMQ/) and [1/2
inch](https://www.amazon.com/gp/product/B0090JVDNA/) from Amazon.
