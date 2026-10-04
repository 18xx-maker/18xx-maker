# Questions and answers

## Where are my games saved?

A bundled game is part of 18xx Maker. A game you open is not copied anywhere
else: the app and supporting browsers remember where the file is, other
browsers keep a private copy. Removing a game from the [Load Games](/games)
page never deletes your file. See [Files](/docs/files).

## My edits don't show up

The app watches the file. On the website press Refresh in the game menu (or
`r`) for a file opened from your computer; a browser without file access needs
the file opened again. See [Files](/docs/files).

## How do I know if my game file is valid?

Run `pnpm maker validate <file>` (see the [CLI
readme](https://github.com/18xx-maker/18xx-maker/blob/main/src/cli/README.md)).
It lists each problem with its path in the file, for example
`#/trains/0/quantity`, and exits with a non zero code when a file is invalid.
The game schema is not complete, so a file can validate and still not look
right. See [JSON Schemas](/docs/games/schemas).

## How do I export or print?

In the app, use the Export button at the top left of a game page, or the Export
entry of the sidebar (or the `x` key) on any page: pdf, png, svg or
Board18 for the whole game, or _Export options_ to choose. On the website the
button opens your browser's print dialog. See [PDF Output](/docs/output/pdf),
[PNG Output](/docs/output/png), [SVG Output](/docs/output/svg) (to edit the
map, tiles or tokens in Inkscape or Illustrator) and [Board18
Output](/docs/output/b18). The
command line can export too, with `maker export`; its options are in the CLI
readme and can be stored in the game file, see [Export
Options](/docs/games/exports).

## What page size is used?

Paginated pages default to US Letter (8.5 by 11 inches) and the size can be
changed in the [config panel](?config=true). See [Using 18xx
Maker](/docs).

## Will it print at the real size?

Print output is made at physical sizes, so print with the scale at 100 percent
and no "fit to page" option. PNG exports are made at 300 dpi by default and carry
their resolution, so they open at their real size. See [PNG Output](/docs/output/png).

## Exports are always light, even in dark mode. Why?

Exports always render in the light theme, whatever theme your system uses, so
images are white (or transparent, if you choose that) and ready to print.
