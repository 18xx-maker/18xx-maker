# PNG Output

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![export button](/images/export-button.png)

> [!NOTE]
> If you are using 18xx Maker in a web browser please note that this button
> doesn't exist and instead shows a print icon. It only opens your browser's
> print menu.

This will expose a menu with export options. You can either export a full game
to PNG images. Exporting this way
_will_ respect any config options you have set in the app.

If you choose to export a full game you are asked to pick a folder to put all of
the files. The files _do_ contain the game name in them, but it's suggested that
you create a folder specifically for this game to help with your own
organization. Outputing a game to PNG images results in a _LOT_ of images. When
the export is complete the app will open the resulting folder.

Exporting a full game will result in an individual image for every tile, card,
charter and token. The images that are directly tied to a company will have the
companies abbrev in them and all images will be indexed with a increasing digit
(to protect for games that have two companies with the same abbrev).

Images are made at 300 dpi, the resolution to print at, and carry their
resolution so they open at their real size. The _Export options_ panel lets you
choose a lower resolution (1 to 300 dpi). A game file can set the resolution
(and the other export options) with `"exports": { "png": { "dpi": 150 } }`, see
[Export options](/docs/games/exports): the panel starts with it.

An image only has the pixels its component covers whole, so it can be a pixel
smaller than its size in inches times the resolution (a card of 2.657 by 1.732
inches is 796 by 518 pixels at 300 dpi), but it never has an edge that is
partly transparent or blended with the background. The app and the command line
make the same images.

## Command Line

> [!IMPORTANT]
> This workflow requires you to have the source code for the app and have
> followed the instructions for [local
> development](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).

You can output an image for every tile, card, charter, token and the single
pages (background, map, market, par, revenue and tile manifest) by running:

```bash
pnpm build && pnpm maker export <game> --format png
```

where `<game>` is the id of a bundled game or the path to a game file. The files
are written to `render/<game>`, named after the game's title.

Images are made for printing: 300 dpi is the default and the highest
resolution, a lower one is set with `--dpi` (1 to 300, `--dpi 301` is
refused). The resolution is written into the file, so a card that is 2.5 by 3.5
inches opens at that size in an image viewer and prints at that size. Colors are
sRGB. The map, market, par, revenue and tile manifest are on white, or
transparent with `--background transparent`; every other image (the background
page, cards, charters, tokens and tiles) is always transparent, and the images
of a Board18 box do not take it. An image of more than
200 megapixels (a huge map at 300 dpi) is not made, the command says so and you
can lower the `--dpi`. A document that takes more than two minutes fails.

```bash
# Only the cards and the map, at 150 dpi
pnpm maker export 1889 --format png --docs cards,map --dpi 150
```

The format, the pages and the resolution can be set in the game file instead,
with `"exports": { "formats": ["png"], "docs": ["cards", "map"], "png": { "dpi":
150 } }`. A flag wins over the game file, and the game file over the defaults,
so `pnpm maker export my-game.json --dpi 300` exports that game at 300 dpi (and
the _PNG resolution_ of the panel starts at the game file's and can be changed). A
resolution over 300 is an error in the game file too (`pnpm validate` says so).
See [Export options](/docs/games/exports) for all of them.

Remember that this will not use the options setup in the browser config page,
see [PDF output](/docs/output/pdf) for how to use your config.
