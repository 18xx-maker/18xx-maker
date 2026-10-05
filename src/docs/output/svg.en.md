# SVG Output

SVG files are vector graphics: you can open them in Inkscape, Illustrator or
Affinity Designer, edit them and scale them to any size without losing quality.
Where a PNG is a picture of a component, an SVG keeps the shapes, the colors and
the text.

On the 18xx Maker application you can browse to any game component and then
click on the export button:

![Toolbar of a game page with the export button circled](/images/export-button-light.png "The export button in the app's toolbar.")

> [!NOTE]
> If you are using 18xx Maker in a web browser please note that this button
> doesn't exist and instead shows a print icon. It only opens your browser's
> print menu.

Choose _Export game as svg images_ (press `s` with the menu open) or tick _SVG
images_ in the _Export options_ panel. Exporting this way _will_ respect any
config options you have set in the app. You are asked to pick a folder (the app
remembers it) and one file is written in `<game id>/svg` in it for every map
(one for each variation), market, par table,
revenue table, tile and token. The files contain the game name, and the app
opens the folder when the export is complete.

The pages that are not one drawing have no SVG: the cards and charters (they are
text and boxes made with HTML), the background page, the tile manifest and the
sheets. Export those as [PDF](/docs/output/pdf) or [PNG](/docs/output/png).

## What is in the file

- The file is only the drawing, at the size it prints (a tile that is 2 inches
  wide is 192 units, one unit being 1/96 inch like in every vector program). It
  is transparent: there is no background and no border, and the `dpi` and
  `background` options do not apply.
- Every color, line and font is written in the file itself (no style sheet or
  classes), so it looks the same in every program.
- A token has an SVG for each of its sides and sizes, side by side in one file.
- Images are always rendered in the light theme.

### Fonts

The text is kept as text, so you can still change it. That means the program
needs the fonts to show it the way it was designed. The fonts of 18xx Maker are
[Bitter](https://fonts.google.com/specimen/Bitter) (titles and numbers),
[Yrsa](https://fonts.google.com/specimen/Yrsa) and
[Lato](https://fonts.google.com/specimen/Lato): install the ones you use. A
comment at the top of every file lists the fonts of its text. A program without
the font shows the text in another font, which can change its width.

To share a file with someone who does not have the fonts, or to send it to a
print shop, convert the text to paths first: _Path > Object to Path_ in
Inkscape, _Type > Create Outlines_ in Illustrator. The text can not be edited
after that.

## Command Line

> [!IMPORTANT]
> This workflow requires you to have the source code for the app and have
> followed the instructions for [local
> development](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).

```bash
pnpm build && pnpm maker export <game> --format svg
```

where `<game>` is the id of a bundled game or the path to a game file. The files
are written to `render/<game>/svg`, named after the game's title.

```bash
# Only the map and the tiles
pnpm maker export 1889 --format svg --docs map,tiles

# Only the second variation of the map
pnpm maker export 1889 --format svg --docs map --variation 1
```

SVG is not exported unless you ask for it. To always export it for a game, add it
to the game file with `"exports": { "formats": ["pdf", "svg"] }`, see [Export
options](/docs/games/exports). The `--dpi` and `--background` flags only change
PNG files and are ignored for SVG files.

Remember that this will not use the options setup in the browser config page,
see [PDF output](/docs/output/pdf) for how to use your config.
