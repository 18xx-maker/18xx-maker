# Files

18xx Maker uses a lot of different browser technologies to deal with files and
it can be confusing. This page should help sort out what is happening.

## Bundled Games

18xx Maker comes with a bunch of json files pre-bundled into the app and the web
page. Some examples are [Shikoku 1889](/games/1889/map) and [The Old Prince
1871](/games/TheOldPrince1871/map). These games are always listed on the [Load
Games](/games) page. You can download the json to see how the games are built
using the "Download" (on the web) or "Save" (in the app) button on the game's
info page. To keep a copy you can edit and save, use "Save as..." in the game
menu (or on the Changes page): it asks for a file name, saves a copy of the game
as it is now, and opens that copy. The bundled game itself never changes.

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

To start from scratch, click the "New Game" button on the [Load Games](/games) page. The app asks where to save the new game, writes a small game there (a title and a block of 4 by 4 hexes) and opens it on the map, ready to edit. The new file is listed like any game you open.

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

To start from scratch, click the "New Game" button on the [Load Games](/games) page. The browser asks where to save the new game, writes a small game there (a title and a block of 4 by 4 hexes) and opens it on the map, ready to edit. The new file is listed like any game you open. A browser that can not save files this way (see below) keeps the new game in the Origin Private File System instead.

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

The "New Game" button on the [Load Games](/games) page creates a small game (a title and a block of 4 by 4 hexes) in this separate place and opens it on the map, ready to edit. Use the Download button on the game page to get a copy as a file.

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

Above the form is a search box to find a field of the open section by its name (`/` focuses it). Enter goes to the next match, opening the card it is in, and scrolls to the field and marks it, with the focus staying in the search box so Enter goes on to the next one; Shift+Enter goes back, Alt+Enter focuses the field of the current match and Escape clears the text. The search does not look inside the closed "More fields" section of a card. On the Trains, Privates and Companies tabs a filter box above the cards narrows them to the ones whose name, abbreviation, title or note has the text you type. Filtering only hides cards, it does not change the game, and adding an item clears it.

The panel has a section for each part of the game it edits, shown as chips under
the group names "Game", "Equipment" and "Look and output". The Forms | JSON | Problems switch in
the header goes between these forms, the JSON editor (below) and the list of
problems of the game, and Forms goes back to the form you were on. A red dot on
Problems means the game has problems. Click a problem there to open the JSON
editor at its line. Press `[` and `]` to switch between the form
sections (from the JSON editor or the problems they go to the last form; the number keys go to
another section of the game and keep the panel open). A red dot on a chip
marks a section with problems; its label says how many. Changes stay in memory
until you save them from the Review and save changes button below the form.
The Trains tab has a card for each train of the game, generated from the same
schema. Add a train with Add train, and use the buttons of a card to move it up
or down, duplicate it or remove it. A removed train can be put back with Undo
right after. The fields of a train that are not needed often are under More
fields. A field the schema marks as deprecated stays editable and is shown with
a warning.

The Privates tab works the same way for the privates of the game. A card
shows the name, price, revenue, and company first. The revenue
is a number or a list written as it prints, like `10/20`; text that is not
numbers, like `$10/$20`, stays text. The other fields, like the note and description, are under More fields.

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
are numbered, and the optional steps) and the colors of the number cards.

The Tokens tab edits the tokens of the token sheet, the token types and the
share types. A token is a row of text or a number (the label of a white token)
or, with Add token with options, a card with its label, icon, logo and color
first and the other token fields under More fields. A token type lists the
token spaces of a charter the same way (a cost, and whether the company starts
with a token in it), and a share type lists its shares (the quantity, label,
percent and cost first). When you rename or remove a type, the editor warns how
many companies still use it by the old name.

The token of a company and of a private (under More fields), and each token of
the Tokens tab, has an Edit token button that opens the token editor in a
dialog. A preview shows the token as it prints, on a light or a dark
background, and every change goes into the game as you make it: there is
nothing to save, and Reset goes back to the token as it was when the dialog
opened. The shape, the content (logo, icon and label), the colors and the
decorations (a bar, stripes, a shield, halves and so on, each with its own
options) are grouped, and every other property is under Advanced. A shape that
takes a color is a color or true (white), and one with several colors, like
halves, has a field for each color. A token of the list of tokens that has only
a label stays text or a number. What the editor does not know stays in the
token.

The Colors tab edits the named colors of the game. Each color has a swatch
that opens the color picker and a text field for any CSS color or the name of
another color; Add color adds one and the name field renames or removes it. A
color that differs by phase is an object, which stays JSON.

The Output tab edits the range of the revenue chart (the first and last
revenue and how many are in a row), the export defaults of the game (the
files to export, the pages, the layouts, the background, the variation and the
png, card and Board18 options). The deprecated paginated
export option is not shown and stays in the file.

The Map tab is on every page (from another page it goes to the map) and edits everything of the selected map
variation (`?variation=`) except its hexes: the name, which variation it copies
(for a list of variations; the copied hexes can be removed by coordinate, one per
line), whether the title is hidden, the trimmed edges, the round tracker, the
movement, the market and players positions, and the borders, lines and border
texts, a card each with its coordinates one per line. The borders, lines, border
texts and trim of a copied variation are those of the variation it copies plus
its own. The hexes themselves are the Hex tab's.

The Hex tab is on every page too (it goes to the map). Click a hex on the map to pick its group,
the entry of `map.hexes` that lists it: the tab then shows only that group, as a
form by default and as JSON with the Form and JSON switch, and the hexes of the
group are outlined on the map. The form draws the hex as the map does with a
button on each edge: click two edges to draw the track between them, pick an
element from the list or the drawing to edit its fields, and add, copy, move or
remove elements. Drag a city, town, label or other element to move it (its `x` and `y`), and undo or redo changes with the buttons or Ctrl or Cmd+Z and Ctrl or Cmd+Shift+Z; a drag is one step, and the history starts over for each hex and when you switch to the JSON view and back. The shortcuts do not apply while the focus is in a field. The form writes only what you change. The JSON view cannot be
left while its text is not valid. A note tells when a change applies to several
hexes of the group or when another group also lists the hex. Empty positions can be picked too, and so can
the row and the column just past the map. The page follows the text while it is
a valid group, an object with a `hexes` list of at least one coordinate such as
`B2`; anything else stays a draft and the game keeps its last valid version.
Hold Cmd (Ctrl on Windows and Linux) and click another hex to move it into the
group, out of the group it was in, or click a hex of the group to take it out.
A group left with no hex is removed, and the last hex of the map stays. The
group of an empty position is added to the game when you first change it.
Escape lets go of the group. The address keeps it as `hex`, the first
coordinate of the group (`?edit=true&editSection=hex&hex=C11`). Picking hexes
works on the pan and zoom map on screen while the panel is open, and the
printed and exported maps do not change. A map variation that copies another
shows the hexes it copies as JSON you can read: change them in the variation
they come from, or press _Override here_ to make a copy of the hex in this
variation and edit that. The edge buttons and the lists of the form work from the keyboard. Every element has fields of its own, and the button _Edit C11 only_ (with the coordinate of the hex) gives a hex of a group of several a copy of the group to itself, so that changes are for that hex only. See the [Hex Editor](/docs/games/hex-editor).

The Tiles tab is on every page (from another page it goes to the tiles page) and edits the `tiles` of the game. It
lists the tiles in the order of the file. Type an id and press Add tile to add
one: an id of a tile that 18xx Maker already knows is added as it is (a
quantity of 1), any other id starts a tile of your own that you then draw. Pick a
tile in the list to edit it (the address keeps it as `tile`, for example
`?tile=26%257CT2` for `26|T2`). On the tile sheets you can also click a tile to pick it (every copy of it is outlined), and click the dashed + cell after the last tile, or any other empty space of the sheet, to add a new tile (`T1`, `T2`, ...) and pick it; this only works while the edit panel is open, the printed sheets do not change. A tile of your own is edited like a hex of the map,
drawn as the tile sheets draw it, with its quantity, print and group. A tile
that is drawn from the library, a plain quantity, an alias of another tile or a
partial change of a library tile, shows the tile as it is drawn and only its
quantity, print and group can be changed; the library itself is never edited.
Press _Customize_ to copy the library tile into the game as a tile of your own
and edit that. Changing the quantity of a quantity keeps it a plain number, and
no field is added that you did not change. The quantity is a number field with
arrows and an _Infinity_ toggle. Copy tile adds a copy after the tile,
Remove tile takes it away (the last one removes `tiles`), and _Rename_ gives it
another id (the order of the list is kept, except that ids that are whole
numbers always come first) and in the privates that draw it. A tile drawn from
the library can only change the part of its id after the `|`, because the id is
how the library tile is found: customize it first to rename it freely. Tiles are
not on the map, so the map is not changed by any of this.

The Config tab edits the `config` of the game as JSON, the settings that are
applied for this game when _Allow game config_ is on in the [config
panel](/docs/config). It is an object like `{ "fonts": { "roles": { "title": {
"style": "italic" } } } }`. The page follows the text while it is a JSON
object; anything else stays a draft. A value the [config
schema](/docs/games/schemas) does not allow (a font `size` of `"big"`) is
marked in the text and puts a red dot on the tab. Emptying the object removes
`config` from the game.

The edits stay in the loaded game. Review and save them on the Changes page,
described next.

### JSON editor

The JSON editor edits the whole game as JSON (the same text as the Download
button writes, without the meta). Press `j` on any page while a game is loaded to
open the panel on the JSON editor, to switch to it, or, outside the editor, to close
the panel. The parts of the game other than `info` start folded. The page follows what
you type, a moment after you stop, but only while the text is a valid JSON
object with an `info` object and a text `info.title`. While it is not, the game
keeps its last valid version, and the problem is shown below the editor with
its line and column. The parser's own message is only in English. Your
unfinished text is kept when you switch tabs or close the panel, until you
discard it or reload the page. Problems with the game itself (an unknown field,
a wrong type) only warn: they are marked in the margin and listed in the
Problems tab and on the [Problems page](/docs/games/schemas), and the game is still updated.

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
Bundled games cannot be saved over, they have no file: use "Save as..." to save a copy, or Download. If the file changed outside 18xx Maker
since it was loaded, nothing is written until you choose to reload it (losing
your changes) or to overwrite it.

Every save in the current session is listed on the History page: the file as it
was before that save. "View diff" compares it with the game as it is now, and
"Restore" puts it back as your unsaved changes. The history is not kept when
you load another game or reload the page. Unsaved changes are not kept either:
the browser asks before the page is closed or reloaded.
