# PDF Output

## Application

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![export button](/images/export-button.png)

> [!NOTE]
> If you are using 18xx Maker in a web browser please note that this button
> doesn't exist and instead shows a print icon. It only opens your browser's
> print menu.

This will expose a menu with export options. You can either export a full game
to PDF documents or the individual component that you are on. Exporting this way
_will_ respect any config options you have set in the app.

If you choose to export a full game you are asked to pick a folder to put all of
the files. The files _do_ contain the game name in them, but it's suggested that
you create a folder specifically for this game to help with your own
organization. When the export is complete the app will open the resulting
folder.

If you choose to export the current component the app will ask you to select a
full filename for the resulting PDF file. When the export is complete the app
will open the resulting PDF.

## Command Line

> [!IMPORTANT]
> This workflow requires you to have the source code for the app and have
> followed the instructions for [local
> development](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).

You can output straight to PDF files by running:

```bash
pnpm build && pnpm maker export <game> --format pdf --paginated
```

where `<game>` is the id of a bundled game, or the path to a game file (it is
checked against the game schema first, and the folder is named after the file).
For example, here is me printing 1889:

```bash
pnpm build && pnpm maker export 1889 --format pdf --paginated
```

`pnpm maker print 1889` is the same thing (the game defaults to `1889`). Other
useful options are `--docs map,cards` to only export some pages, `--layouts all`
to get a sheet for every layout, `--variation 1` for one map variation,
`--config my-config.json` for a config file on top of `src/config.json`,
`--out <folder>` for another folder than `render` and `--jobs 3` to capture
three files at the same time. `pnpm maker help export` lists them all.

Remember that this will not use the options setup in the browser config page. In
order to make your printed output identical to what you see in the browser, go
to the [config](/config) page and copy the json found at the bottom into
`src/config.json` replacing anything previously there.

This will build the app, then output a bunch of files into the
`render/1889` folder:

```
render
└── 1889
    ├── shikoku-1889-background.pdf
    ├── shikoku-1889-cards-miniEuroDie.pdf
    ├── shikoku-1889-charters.pdf
    ├── shikoku-1889-map-paginated.pdf
    ├── shikoku-1889-map.pdf
    ├── shikoku-1889-market-paginated.pdf
    ├── shikoku-1889-market.pdf
    ├── shikoku-1889-par-paginated.pdf
    ├── shikoku-1889-par.pdf
    ├── shikoku-1889-revenue-paginated.pdf
    ├── shikoku-1889-revenue.pdf
    ├── shikoku-1889-tile-manifest.pdf
    ├── shikoku-1889-tiles-die.pdf
    └── shikoku-1889-tokens.pdf
```

The files are named after the game's title (the same names the app uses), the
folder after the game id you typed. PDFs are printed with their backgrounds,
like the app does. The command exits with code 1 if some
documents could not be printed (the others are still written) and with code 2
if it was used wrong, a game does not exist or the site has not been built.

If you want to build all games at once you can run:

```bash
pnpm build && pnpm maker export --all --format pdf --paginated
```
