# Files

18xx Maker uses a lot of different browser technologies to deal with files and
it can be confusing. This page should help sort out what is happening.

## Bundled Games

18xx Maker comes with a bunch of json files pre-bundled into the app and the web
page. Some examples are [Shikoku 1889](/games/1889/map) and [The Old Prince
1871](/games/TheOldPrince1871/map). These games are always listed on the [Load
Games](/games) page. You can download the json to see how the games are built
using the "Download" (on the web) or "Save" (in the app) button on the game's
info page.

To check a game file for mistakes, run `pnpm maker validate my-game.json` (it
checks the file against the game schema, see [JSON schemas](/docs/games/schemas)).
The [command line](/docs/output/cli) page has all the commands, and the
[config panel](/docs/config) and [desktop app](/docs/app) pages describe the
settings stored on your device.

## Using the 18xx Maker app

When using the app, 18xx Maker can get access to your file system. This means
you can load JSON files from your computer. You can open game files in a few
ways:

1. Use the "Open" menu option, and select a valid JSON file
1. Hit the "o" key from anywhere in the app
1. Click on the "Open File" button from the [Load Games](/games) page.
1. Drag a valid JSON file into the app window

In all cases the app will save the location of this file in its memory and then
display the game. You will now see this file listed on the [Load Games](/games)
page. The trash icon on this page **WILL NOT** delete the file, but it will
delete the app's memory of that file and it will disappear from the page.

If you move the file on your computer and try to load it by clicking on the
entry on the [Load Games](/games) page, the app will let you know that it
couldn't find the game and remove the entry from the page.

Once you load a game (via any open method above, or by clicking on the entry for
a previously opened file) the app will load the latest version from the file
system and also start watching the file. Any changes made should be reflected
near instantly in the app.

## Using the 18xx Maker website

The web version of 18xx Maker will behave slightly differently based on whether
your browser supports the [File System
API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API).

### Supporting Browsers

You can load a file from your computer in a few ways:

1. Hit the "o" key from anywhere in the app
1. Click on the "Open File" button from the [Load Games](/games) page.
1. Drag a valid JSON file into the browser window

In all cases the browser will save the location of this file in its memory and
then display the game. You will now see this file listed on the [Load
Games](/games) page. The trash icon on this page **WILL NOT** delete the file,
but it will delete the browser's memory of that file and it will disappear from
the page.

When you come back to the web page in the future your browser might ask you for
permission when you try to load one of these games from the [Load Games](/games)
page. If you do not grant permission to the file, it will be removed from this
page, but you can always open it again via any of the methods listed above.

If you move the file on your computer and try to load it by clicking on the
entry on the [Load Games](/games) page, the web page will let you know that it
couldn't find the game and remove the entry from the page.

The browser can not watch a file for changes. When you load a file in this way a
new option to "Refresh" the file will appear in the toolbar. Clicking this
should refresh the webpage with any changes made locally to the file. You can
also refresh by hitting the "r" key anywhere in the app while a game is loaded
from your file system.

### Non-Supporting Browsers

Even if your browser doesn't support the File System API we will try to use the
[Origin Private File
System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
instead. You can open files in one of two ways:

1. Click on the "Open File" button from the [Load Games](/games) page.
1. Drag a valid JSON file into the browser window

Once you do this the contents of this file are saved to your local computer in a
separate place that only the browser can view. Games will appear on the [Load
Games](/games) page. Clicking on the trash icon on this page **WILL NOT** delete
the file from your computer, but will make the browser forget about this game.

The only way to refresh the file from the data on your computer is to open it
again using one of the methods above.

## Importing a config.json

Settings you changed in the [config panel](?config=true) can be saved as a
`config.json` from the Data section. To apply such a file somewhere else, drag
it onto the app or website, or paste its contents into the Import box in the
Data section. The imported settings replace your current custom settings. A
dropped json file is treated as a config when it only contains config settings,
otherwise it is loaded as a game.

## Editing the game info

On a game's edit pages the Edit button in the toolbar (or the `e` key) opens a
panel beside the page with a form for the game info, the links and the
prototype and work in progress flags. The page stays visible and follows what
you type. The form is generated from the [game file schema](/docs/games/schemas),
so a new field in these parts of the schema shows up in the panel without a
change to the app. Field names and descriptions come from the schema and are
only in English. A field is passed on when you leave it or press Enter, and
emptying a field removes it from the game (the title cannot be removed).
Problems with a value, like a currency without a `#`, are shown below its field.
Escape closes the panel (see below for the JSON editor).

The panel has a tab for each part of the game it edits. Press `[` and `]` to switch between
them (the number keys go to another section of the game and close the panel).
The Trains tab has a card for each train of the game, generated from the same
schema. Add a train with Add train, and use the buttons of a card to move it up
or down, duplicate it or remove it. A removed train can be put back with Undo
right after. The fields of a train that are not needed often are under More
fields. A field the schema marks as deprecated stays editable and is shown with
a warning.

The Privates tab works the same way for the privates of the game. A card
shows the name, price, revenue, and company first. The revenue
is a number or a list written as it prints, like `10/20`; text that is not
numbers, like `$10/$20`, stays text. The abilities of a private are edited as
JSON, and the other fields, like the note and description, are under More fields.

The Companies tab works the same way for the companies of the game. Because a
company has many fields, its card starts closed and shows its color, name and
abbreviation; click the title to open it. A closed card shows a warning mark
when something inside it has a problem. The name, abbreviation, color and minor
flag are shown first, and the other fields, like the logo and the charter text,
are under More fields. The shares, tokens, trains, loans and similar fields are
edited as JSON. A company needs a name and an abbreviation, which cannot be
emptied. A new company gets a free abbreviation, and a copy gets the abbreviation
of its source with a number (PRR becomes PRR2). Other parts of the game, like
the market, refer to a company by its abbreviation: the panel does not update
those references when you rename one.

The Phases tab works the same way for the phases of the game. A card shows
the name, limit, tiles, train, minor flag and rounds first, and the company,
the event the phase starts on, the notes, buying companies and events are under
More fields. The limit is a whole number, `∞` or a fraction like `3/4`. The
train and the notes are text, or a list when you write one entry on each line
(a single line is saved as plain text). A phase needs a limit and tiles, which
cannot be emptied, and a name or a train. A phase with neither shows the
message of the schema that one of several options must match, and a new phase
in a game whose phases have no name gets a train instead of a name. The event a
phase starts on (`on`) is edited as JSON, so type a train name with its quotes,
like `"3"`. Names are how other parts of the game refer to a phase or a train:
the panel does not update those references when you rename one.

The Market tab edits the stock market: the type (2D, 1D or 1Diag), a grid of
the cells, the cell defaults, the legend and the movement. Click a cell, or
move with the arrow keys, to edit it in the form below the grid: its value,
label, color, legend entry, par flag, arrows and more. Delete empties a cell
and a number key goes to its value. The buttons above the grid add, move,
duplicate and remove the row or column of the selected cell; a removed row or
column can be put back with Undo. A market is often a triangle, so rows can
have different lengths and are never padded. A 1Diag market is drawn in two
rows and a column of it is two cells. A cell that only has a value or only a
label is saved as that number or text, and becomes an object when you set a
second field. Changing the type to 1D or 1Diag keeps the first row only, with
an Undo. Legend entries are used by their number: moving or removing one shows
how many cells now point to another entry, their numbers are not changed. The
display, ledges, limits and title are JSON fields under Advanced.

The Players tab edits the bank, the capital and the certificate limit of the
game, the percent of a company that must be sold for it to float, and the
players table: a card for each player count, titled like "3 players", with its
number, capital and certificate limit first and the bank under More fields.
The bank, the capital and the certificate limit are a number or text: a number
is saved as a number, and text like `∞` or `3/4` stays text. Add player
gives the next number, and a copy gets the next free number too. A player needs
a number, which cannot be emptied. The numbers are not kept in order or checked
for repeats: the problems check reports what the schema does not allow.

The Rounds tab edits the rounds of the round tracker (a card for each round
token, with its name and color first and the other token fields under More
fields), the turns printed on the charter (a name, its steps, whether the steps
are numbered, and the optional steps), the notes about the pools (a name and a
list of notes with an optional color and icon, kept for reference and not
printed) and the colors of the number cards.

The edits stay in the loaded game. Review and save them on the Changes page,
described next.

### JSON editor

The JSON tab edits the whole game as JSON (the same text as the Download
button writes, without the meta). Press `j` on any page while a game is loaded to
open the panel on this tab, to switch to it, or, outside the editor, to close
the panel. The parts of the game other than `info` start folded. The page follows what
you type, a moment after you stop, but only while the text is a valid JSON
object with an `info` object and a text `info.title`. While it is not, the game
keeps its last valid version, and the problem is shown below the editor with
its line and column. The parser's own message is only in English. Your
unfinished text is kept when you switch tabs or close the panel, until you
discard it or reload the page. Problems with the game itself (an unknown field,
a wrong type) only warn: they are marked in the margin and listed on the
[Problems page](/docs/games/schemas), and the game is still updated.

Format rewrites the text with an indent of 2 spaces. It is only available while
the JSON is valid, and warns first when names are used twice in an object or
numbers have more digits than can be stored, as both are lost. A trailing comma
or single quotes can be fixed from the marker in the margin. Changing the game
somewhere else (Revert on the Changes page, restoring from the history) updates
the text. If your text was not valid at that moment it is left alone, and a note
says the game changed.

Tab indents inside the editor. To leave it, press Escape (the first Escape
leaves the editor, a second closes the panel) and then Tab.

#### Editor keys

The Editor keys setting on the [Settings page](/settings) chooses the keys of
the JSON editor: Normal (the default), Emacs or Vim. The Emacs and Vim keys
load when you choose them, and changing the setting keeps your text and its
undo history. The keys only work while the editor has focus. `Mod` is Cmd on
macOS and Ctrl on Windows and Linux. In Emacs and Vim the Normal keys also work
on macOS; elsewhere Ctrl belongs to the mode. Copy, paste, undo and select all
keep their usual keys in Normal. In Vim, Escape leaves the editor only when
Vim is in normal mode with no command pending. Search has its own keys in
Emacs and Vim.

| Action                            | Normal                       | Emacs        | Vim        |
| --------------------------------- | ---------------------------- | ------------ | ---------- |
| Format                            | `Mod-Shift-f`, `Shift-Alt-f` | `C-c C-f`    | `:format`  |
| Update the game from the text now | `Mod-s`                      | `C-x C-s`    | `:w`       |
| Next problem                      | `F8`                         | `M-g n`      | `]d`       |
| Previous problem                  | `Shift-F8`                   | `M-g p`      | `[d`       |
| Search                            | `Mod-f`                      | `C-s`, `C-r` | `/`, `?`   |
| Next match                        | `Mod-g`                      |              |            |
| Previous match                    | `Shift-Mod-g`                |              |            |
| Fold or unfold everything         | `Ctrl-Alt-[`, `Ctrl-Alt-]`   |              | `zM`, `zR` |

### Links to a part of the editor

The address of the page says where you are, so you can share it or come back
to it: the section (`/games/18Test/tiles`), the open panel and its tab
(`?edit=true&editSection=json`, `?config=true&section=tokens`) and the card
filters (`?hidePrivates=true`). A tab or section name that does not exist opens
the first one.

In the JSON editor, click a line number to mark that line. Shift-click marks
the lines from the first marked line to the one you click, and Cmd-click (Ctrl
on Windows and Linux) adds or removes one line, or with Shift as well adds the
range. The marked lines are in the address as `lines`, for example
`?edit=true&editSection=json&lines=1-4,15,16,19`, and the editor scrolls to the
first one when the link is opened. Marking lines does not add pages to the
browser history. The lines are forgotten when you change the tab or close the
panel.

## Changes, saving and history

When the loaded game differs from its file, a Changes entry appears in the game
menu (and in the toolbar), with the number of top level fields that changed. It
opens a page with a highlighted diff of the game against the file as it was
loaded or last saved. The diff compares the game as JSON with 2 spaces, so
whitespace-only differences in your file are not shown.

On the Changes page, "Save" writes the game over its file, with the same
content as the Download button, so the first save may reformat the file.
"Revert to saved" drops the changes. Saving works for games in the app, for
games opened from your file system in a supporting browser (the browser asks
for permission to write), and for games in the browser's private file system.
Bundled games can only be downloaded. If the file changed outside 18xx Maker
since it was loaded, nothing is written until you choose to reload it (losing
your changes) or to overwrite it.

Every save in the current session is listed on the History page: the file as it
was before that save. "View diff" compares it with the game as it is now, and
"Restore" puts it back as your unsaved changes. The history is not kept when
you load another game or reload the page. Unsaved changes are not kept either:
the browser asks before the page is closed or reloaded.
