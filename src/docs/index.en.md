# Using 18xx Maker

Howdy! This is the documentation section for 18xx Maker. Hopefully we can get
you up and creating game prototypes in no time. This page talks about two common
use cases. For more information please explore the other docs available from the
site menu on the left.

> [!TIP]
> These docs are about using 18xx Maker. If you are interested in hacking on the
> code or running the code locally please refer to
> [DEVELOPMENT.md](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
> in the code repository.

## Printing a game

The easiest way to print a game is by browsing to the component you want to
print on the website and then printing the page right from the browser. The page
will print with all current config settings and options.

For example, if you want to print a paginated map for [Shikoku
1889](https://18xx-maker.com/games/1889), you should browse to the [map
page](https://18xx-maker.com/games/1889/map), and then select the
[Paginate](https://18xx-maker.com/games/1889/map?paginated=true) open in the
left hand game menu. Then you can select "Print" from your browsers menu.

The game will print without any UI elements from the page. You can use your
systems ability to print directly to a PDF file as well. The defaults for the
site are using US Letter sized paper for paginated items. You can change this in
the site's config (these settings are global, not per game). If you want to
print a non-paginated component you'll need to set the paper size in your
system's print dialog properly to fit. Otherwise this printing will be paginated
by your operating system (with bad results).

> [!TIP]
> Make sure to explore the [config
> panel](https://18xx-maker.com/games/1889/map?config=true). It lets you
> customize how a game is displayed and printed. We have many color themes
> available!

### Exporting from the 18xx Maker app

When using the [app](https://github.com/18xx-maker/18xx-maker/releases) there is
a button in the lower right of every game page that has four options for
exporting:

- Export the full game as PDF files
- Export the full game as individual component PNG files
- Export the current component as a PDF file
- Export the current component as a PNG file

The full game options ask you to pick a folder on your file system and will dump
all files into this directory. The app will open this directory on your file
system when it's done. The single options ask you for a individual file to
export to and will open the individual file that was exported when they finish.

> [!NOTE]
> Not all components support the "current component" PNG option

> [!WARNING]
> The PNG output is currently only set to the DPI of a browser screenshot on
> your system. We would like to support higher DPI output. If you need high
> resolution images the best solution (currently) is doing a custom export
> process from PDF files.

## Creating a new game

> [!NOTE]
> Currently 18xx Maker doesn't allow you to edit a game file on the website or
> in the app. We are working on this functionality.

The quickest way to create a new game is to start with a [game
file](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/games) that is
similar to one you would like to make.

Once you have a game file you can drag it into the browser window (or hit the
`o` key from anywhere on the site) to load this game file into your
browser. Depending on your browser we either copy the game into the browser, or
use it directly from your file system. On the web you'll either need to load the
game again when you make changes or select "Refresh" from the left game menu
when you make changes. If you are using the 18xx Maker app the app will reload
every time you edit the JSON file for you.

Learning what is available in the JSON file is a tricky process. Please make use
of the [elements](/elements) page to see most things that can be done on a tile
or map hex. The second best resource right now is asking in the
[discord](https://discord.gg/gcYvAjYYfw).

## Keybindings

When using 18xx Maker from the website or the app the following keybindings are
available:

| Key | Use                                           | Notes                                 |
| --- | --------------------------------------------- | ------------------------------------- |
| `c` | Navigate to the Logos page                    |                                       |
| `e` | Navigate to the Elements page                 |                                       |
| `g` | Navigate to the Game Map page                 | Only if you have a game loaded        |
| `h` | Navigate to the Home page                     |                                       |
| `l` | Navigate to the Load Game page                |                                       |
| `o` | Open a new game file from your system         |                                       |
| `r` | Refresh the current game from the file system | Web only. Only on supported browsers. |
| `t` | Navigate to the Tiles page                    |                                       |
| `u` | Navigate to the App Info page                 | App only.                             |
| `?` | Navigate to the Help page                     |                                       |
