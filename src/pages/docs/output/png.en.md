# PNG Output

_Note:_ Currently there is no ability to generate PNG images on the command line
without running the app.

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![export button](/images/export-button.png)

_Note:_ if you are using 18xx Maker in a web browser please note that this
button doesn't exist and instead shows a print icon. It only opens your
browser's print menu.

This will expose a menu with export options. You can either export a full game
to PNG images or the individual component that you are on. Exporting this way
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

If you choose to export the current component the app will ask you to select a
full filename for the resulting PDF file. When the export is complete the app
will open the resulting PDF. Printing individual PNG's only works on the
following components:

- Background
- Map
- Market
- Par
- Revenue
- Tile Manifest

Other components will silently fail to generate a image. If you need images for
these components export the full game as PNG images.
