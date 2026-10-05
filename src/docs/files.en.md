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
