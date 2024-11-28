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
pnpm build && pnpm maker print <game>
```

where `<game>` is which game to build. Game defaults to `1889`. For example,
here is me printing 1889 explicitly:

```bash
pnpm build && pnpm maker print 1889
```

Remember that this will not use the options setup in the browser config page. In
order to make your printed output identical to what you see in the browser, go
to the [config](/config) page and copy the json found at the bottom into
`src/config.json` replacing anything previously there.

This will build the app, then output a bunch of files into the
`render/1889` folder:

```
render
└── 1889
    ├── 1889-background.pdf
    ├── 1889-cards-miniEuroDie.pdf
    ├── 1889-charters.pdf
    ├── 1889-map-paginated.pdf
    ├── 1889-map.pdf
    ├── 1889-market-paginated.pdf
    ├── 1889-market.pdf
    ├── 1889-par-paginated.pdf
    ├── 1889-par.pdf
    ├── 1889-revenue-paginated.pdf
    ├── 1889-revenue.pdf
    ├── 1889-tile-manifest.pdf
    ├── 1889-tiles-die.pdf
    └── 1889-tokens.pdf
```

If you want to build all games at once you can run:

```bash
pnpm build && pnpm maker print --all
```
