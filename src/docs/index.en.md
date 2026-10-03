# Using 18xx Maker

Howdy! This is the documentation section for 18xx Maker. Hopefully we can get
you up and creating game prototypes in no time. This page talks about two common
use cases. For more information please explore the other docs available from the
site menu on the left.

New to this? Follow the [first game tutorial](/docs/games/first-game), and see
the [FAQ](/docs/faq) for common questions.

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
1889](/games/1889), you should browse to the [map page](/games/1889/map), and
then turn on the Paginate switch in the toolbar at the top left (or open the
[paginated map](/games/1889/map?paginated=true) directly). Then you can select
"Print" from your browser's menu.

The game will print without any UI elements from the page. You can use your
systems ability to print directly to a PDF file as well. The defaults for the
site are using US Letter sized paper for paginated items. You can change this in
the site's config (these settings are global, not per game). If you want to
print a non-paginated component you'll need to set the paper size in your
system's print dialog properly to fit. Otherwise this printing will be paginated
by your operating system (with bad results).

> [!TIP]
> Make sure to explore the [config panel](?config=true). It lets you customize
> how a game is displayed and printed. We have many color themes available!

### Exporting from the 18xx Maker app

When using the [app](https://github.com/18xx-maker/18xx-maker/releases) there is
a button in the toolbar at the top left of every game page (the one next to the
Paginate switch):

![Toolbar of a game page with the back, config, page, export and paginate controls labeled](/images/export-button.png "The toolbar at the top left of every game page in the app. The export button is circled.")

Its menu has these entries:

- Export game as pdf documents
- Export game as png images
- Export game as a Board18 box
- Export options

The full game entries ask you to pick a folder on your file system and will
write all files into it. The app opens the folder when it's done. The Board18
entry puts a zip file and the files in it in the folder. To export one page,
use _Export options_ and choose the documents you want.

A progress alert is shown while an export runs. A full export started from the
_Export options_ panel can be cancelled there; files that were already written
stay. If a document can't be exported the others are still written and the alert
shows the first error.

#### Export options

The _Export options_ entry opens a panel to choose exactly what a full export
makes:

- **Formats:** PDF documents, PNG images and a Board18 box, in any combination.
- **Documents:** which pages to export (map, tiles, cards, tokens, ...), for PDF
  and PNG files.
- **Every layout of a sheet:** a file for each layout of the cards, tiles and
  tokens, instead of only the layout of your config.
- **Map variation:** one variation or every variation, for games with more than
  one map.
- **PNG resolution:** from 1 to 300 dpi. 300 is the default and the maximum.
- **Board18 version and author:** for the Board18 box.

The panel starts from the `exports` field of the game file (see [Export
options](/docs/games/exports)), so a game you share can export the way its
author intended. Change anything in the panel for just this export, or use _Reset
to the game's options_ to go back. The same options are flags of `maker export`
on the command line.

Exports use the same config as the page you see (including a game's own
config and your saved layout settings), but always render in the light theme,
whatever theme the app is using. Files are named after the game's title.

#### PNG images

PNG images are made at 300 dpi by default, the resolution to print at, and carry
that resolution, so a card opens at its real size (2.5 by 3.5 inches) in an image
editor or print program. Choose a lower one in the panel or with `png.dpi` in the
game file's `exports`. Images of a Board18 box are always one pixel for each
unit, whatever the resolution.

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
game again when you make changes or select "Refresh" from the toolbar
when you make changes. If you are using the 18xx Maker app the app will reload
every time you edit the JSON file for you.

To check a game file for mistakes before loading it, run `pnpm maker validate
my-game.json` (see [Files](/docs/files)).

Learning what is available in the JSON file is a tricky process. Please make use
of the [elements](/elements) page to see most things that can be done on a tile
or map hex. The second best resource right now is asking in the
[discord](https://discord.gg/gcYvAjYYfw).

## Keybindings

When using 18xx Maker from the website or the app the following keybindings are
available:

| Key                  | Use                                           | Notes                                                |
| -------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `a`                  | Navigate to the Atoms page                    | Not on a game edit page                              |
| `c`                  | Navigate to the Logos page                    | Not on a game edit page. Toggles config when editing |
| `e`                  | Edit the loaded game at its first section     | On a game edit page, goes back to the game page      |
| `m`, `1` to `9`, `0` | Edit the loaded game at the map or a section  | Only if you have a game loaded                       |
| `Esc`                | Go back to the game page                      | Only on a game edit page                             |
| `g`                  | Navigate to the Game page                     | Only if you have a game loaded                       |
| `h`                  | Navigate to the Home page                     |                                                      |
| `l`                  | Navigate to the Load Game page                |                                                      |
| `o`                  | Open a new game file from your system         |                                                      |
| `r`                  | Refresh the current game from the file system | Web only. Only on supported browsers.                |
| `t`                  | Navigate to the Tiles page                    | Not on a game edit page                              |
| `u`                  | Navigate to the App Info page                 | App only.                                            |
| `v`                  | Reset the view of the map or market editor    | Only on the map and market edit pages                |
| `x`                  | Open the export menu                          | App only. Goes to the loaded game.                   |
| `?`                  | Navigate to the Help page                     |                                                      |

With the export menu open: `p` exports PDFs, `n` exports PNGs, `b` exports a
Board18 file and `o` opens the export options.
