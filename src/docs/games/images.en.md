# Custom Images

You can add your own images to a game and use them by name in the game's JSON:

- **Icons** and **logos** are [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
  files. An icon is used wherever the built-in icons are (the `icon` of a token
  or the `type` of an icon or terrain element), a logo as the `logo` of a token.
- **Train images** are PNG files, used as the `image` of a train.

An image is used as `custom/<name>`, for example `"icon": "custom/star"`. The
name is the name of the file without its extension. Your images never replace a
built-in one, and they are not part of the game's JSON file, so they do not
travel with it when you share the file.

## Names

A name starts with a letter or digit and then has letters, digits, dots,
dashes and underscores, at most 64 characters. Names that Windows reserves
(`con`, `nul`, `com1` and so on) cannot be used, and two names that only differ
in upper and lower case count as the same name.

## Where the images are kept

- **Desktop app**: in the folder `<game>.assets` next to the game file, in the
  folders `icons`, `logos` and `trains`. A game `my-game.json` has its images
  in `my-game.assets/icons/star.svg`. You can also put the files there yourself.
- **Web app**: in your browser's storage, for the games that you opened from
  your file system or that the browser keeps for you. The images stay on this
  computer.
- **Bundled games** cannot take images. Save a copy of the game first.

Up to 200 images per game, 10 MB together, 512 KB for an SVG and 2 MB for a
PNG (at most 4096 by 4096 pixels).

## Adding images

Open the **Images** tab of the game editor to add, rename and delete images and
to see which ones the game uses.

You can also **drag images onto the app** while a game is open:

- A **PNG** is added as a train image, named like the file.
- For an **SVG** a window asks if it is an **icon** or a **logo** and what its
  name is. If the name exists already you can replace the image or rename
  the new one.
- Up to 20 files at once. Other kinds of files and files that are too large
  are reported, the rest is still added.
- A single `.json` file is still opened as a game (or applied as a settings
  file).

If no game is open, or the game is a bundled one, the app shows an error and
adds nothing.

## SVG files

SVG files are cleaned up before they are shown: scripts, animations, links to
other files and external images are removed. The `color-*` classes of the
built-in icons work in your SVGs too, so they follow the theme colors. Draw
icons and logos in a square, centered on the middle of the image.
