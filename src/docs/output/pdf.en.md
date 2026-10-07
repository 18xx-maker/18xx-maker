# PDF Output

## Application

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![Toolbar of a game page with the export button circled](/images/export-button-light.png "The export button in the app's toolbar.")

> [!NOTE]
> If you are using 18xx Maker in a web browser please note that this button
> doesn't exist and instead shows a print icon. It only opens your browser's
> print menu.

![Toolbar of a game page in a web browser with the print button circled](/images/print-button-light.png "In a web browser the same spot shows the print button.")

This will expose a menu with export options: export the full game as PDF
documents, as PNG images, as SVG images or as a Board18 box. Exporting this way
_will_ respect any config options you have set in the app. The _Export options_
entry opens a panel where you choose the formats (PDF, PNG, SVG and Board18), the
documents, if every layout of a sheet is exported and the folder, then exports them all at once. The panel starts with
the options of the game's `exports` field if it has one (see [Export
options](/docs/games/exports)), and what you change there wins. Press _Cancel export_ in
the panel to stop an export that is running; the files that are done stay.

If you choose to export a full game you are asked to pick a folder, and the app
remembers it: the next export opens in the same folder (or in the default one if
it no longer exists). The files go in a folder named after the game id, with a
folder for each of `pdf`, `png` and `svg` in it, the same as the command line.
When the export is complete the app will open the resulting folder if the
_Open the folder after exporting_ setting is on.

## Command Line

> [!IMPORTANT]
> This workflow requires you to have the source code for the app and have
> followed the instructions for [local
> development](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).

You can output straight to PDF files by running:

```bash
pnpm build && pnpm maker export <game> --format pdf
```

where `<game>` is the id of a bundled game, or the path to a game file (it is
checked against the game schema first, and the folder is named after the file).
For example, here is me printing 1889:

```bash
pnpm build && pnpm maker export 1889 --format pdf
```

The map, market, par and revenue pdfs also come as a paginated pdf (`-paginated`)
when they do not fit on one page of your paper.

`pnpm maker print 1889` is the same thing (the game defaults to `1889`). Other
useful options are `--docs map,cards` to only export some pages, `--layouts all`
to get a sheet for every layout, `--variation 1` for one map variation,
`--config my-config.json` for your config file,
`--out <folder>` for another folder than `render` and `--jobs 3` to capture
three files at the same time. `pnpm maker help export` lists them all.

Every one of these options can also be set in the game file, in its `exports`
field (see [Export options](/docs/games/exports)). The game file has the
defaults for that game, and what you give on the command line wins over it. For
example, with `"exports": { "docs": ["map"] }` in the game,
`pnpm maker export my-game.json` exports only the map, and
`pnpm maker export my-game.json --docs cards` exports the cards instead. The
_Export options_ panel has the same options as controls, starting with the game
file's, and a button to go back to them.

Remember that this will not use the options setup in the browser config page. In
order to make your printed output identical to what you see in the browser, open
the [config](?config=true) panel and use "Download config.json" (or copy the json
found at the bottom) into a file, then pass it with `--config`:

```bash
pnpm maker export 1889 --format pdf --config my-config.json
```

A config in `src/config.json` is used too, with `--config` on top of it.

This will build the app, then output a bunch of files into the
`render/1889` folder:

```
render
└── 1889
    └── pdf
        ├── shikoku-1889-background.pdf
        ├── shikoku-1889-cards-miniEuroDie.pdf
        ├── shikoku-1889-charters.pdf
        ├── shikoku-1889-map-paginated.pdf
        ├── shikoku-1889-map.pdf
        ├── shikoku-1889-market-paginated.pdf
        ├── shikoku-1889-market.pdf
        ├── shikoku-1889-par.pdf
        ├── shikoku-1889-revenue-paginated.pdf
        ├── shikoku-1889-revenue.pdf
        ├── shikoku-1889-tile-manifest.pdf
        ├── shikoku-1889-tiles-die.pdf
        └── shikoku-1889-tokens.pdf
```

Each format has its own folder in the game folder: PDFs are in `pdf`, PNGs
in `png` and SVGs in `svg`. The files are named after the game's title (the same names the app uses), the
folder after the game id you typed. PDFs are printed with their backgrounds,
like the app does. The command exits with code 1 if some
documents could not be printed (the others are still written) and with code 2
if it was used wrong, a game does not exist or the site has not been built.

If you want to build all games at once you can run:

```bash
pnpm build && pnpm maker export --all --format pdf
```

## Print Scale

If your printer prints a little too big or too small, set `printScale` in your
config (or in the _Layout_ section of the [config](?config=true) panel) to a
percentage from 50 to 200. 100 is the real size, 95 prints everything 5% smaller
and 105 prints everything 5% bigger, in both directions. The paper size and
margins stay the same, so the sheets are laid out again: at a smaller scale more
tiles, tokens or cards fit on a page, at a bigger scale fewer do. It scales what
you see in the app and in your browser's print menu. Exports (PDF, PNG, SVG and
Board18, from the app or the command line) always use the real size and ignore
it, and so do the Board18 pages. It is a setting of your printer, so a game file
cannot set it.

A few things have a fixed width of 8 inches and do not follow the scale when it
makes a page wider: the die tile sheet, the background page, the tile manifest
and the pins of the card sheets. Check the print preview before printing at a
bigger scale.

## Double-sided Cards

Train cards can have a back: give a train a `back` in the game file (see the
[train fields](/docs/games/trains#train-fields)) and set `duplex` in the _Cards_
part of the config. `off` (the default) prints no backs, `long` prints a page of
backs after every page of fronts, and `separate` prints all the fronts and then
all the backs in the same order, unmirrored on their own sheets, for cutting
and gluing the backs to the fronts, not for feeding the sheets through the
printer again.

Use `long` with the printer set to double-sided, flip on the long edge: the
backs are right aligned, so every back lands behind its front. A card
without a back leaves an empty slot, and a page of backs without any back is
left out. Print at 100% scale with the same cutlines and margins on both sides,
a printer that moves the page between sides is not corrected.

Duplex needs the free cards layout, the die layouts ignore it, and `long` prints
on portrait pages. The pins of a page of backs are on the other side. It is a setting of
your printer, so a game file cannot set it, and the PDF export of the cards
follows it too. The PNG export of cards stays fronts only.
