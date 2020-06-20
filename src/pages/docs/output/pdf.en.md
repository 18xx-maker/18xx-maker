# PDF Output

## Application

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![export button](/images/export-button.png)

_Note:_ if you are using 18xx Maker in a web browser please note that this
button doesn't exist and instead shows a print icon. It only opens your
browser's print menu.

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

**Important:** This workflow requires you to have the source code for the app
and have followed the instructions for local development.

_Note:_ Right now the code path for command line print is done in a slightly
different way than app printing. I hope to combine these into the same code path
eventually but if you have any problems or thoughts on the matter please get in
touch.

You can output straight to PDF files by running:

```sh
yarn build && yarn print <game>
```

where `<game>` is which game to build. For example, here is me printing 1830:

```sh
yarn build && yarn print 1830
```

Remember that this will not use the options setup in the browser config page. In
order to make your printed output identical to what you see in the browser, go
to the [config](/config) page and copy the json found at the bottom into
`src/config.json` replacing anything previously there.

This will build the app, then output a bunch of files into the
`build/render/1830` folder:

```sh
build/render/1830
├── 1830-background.pdf
├── 1830-cards-miniEuroDie.pdf
├── 1830-charters.pdf
├── 1830-map-paginated.pdf
├── 1830-map.pdf
├── 1830-market-paginated.pdf
├── 1830-market.pdf
├── 1830-revenue.pdf
├── 1830-tiles-offset.pdf
├── 1830-tile-manifest.pdf
└── 1830-tokens.pdf
```

If you want to build all games at once you can run:

```sh
yarn build && yarn print all
```
