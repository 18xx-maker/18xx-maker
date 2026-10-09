# Desktop App and Settings

::: siteonly

## Download

18xx Maker is also a desktop application for macOS, Windows and Linux. The
interface is the same as the website, with better support for editing files and
more exporting options (see [Exporting from the 18xx Maker
app](/docs#exporting-from-the-18xx-maker-app)). If you are prototyping your own
game we recommend it. Download the version for your system from the
[releases page](https://github.com/18xx-maker/18xx-maker/releases) and install
it like any other application.

:::

## What the app adds

In the app you open game files straight from your computer and the app watches
them, so your edits show up right away (see [Files](/docs/files#using-the-18xx-maker-app)).
Exports are written to a folder you choose, as described in
[Using 18xx Maker](/docs#exporting-from-the-18xx-maker-app).

## Menu

The app has a native menu. Every keyboard shortcut of the pages has an item in
it, so you can find them there. `Ctrl` is `Cmd` on macOS. The items for the
loaded game do nothing when no game is loaded.

- **File**: _Open_ (`Ctrl+O`) opens a game file, _Open Recents_ lists the games
  you opened before, _Save_ (`Ctrl+S`) saves the game you are editing,
  _Export..._ (`Ctrl+Shift+E`) opens the export menu, _Download Game_
  (`Ctrl+Shift+D`) saves the game file, and _Quit_.
- **Edit**: the usual undo, cut, copy and paste commands, then _Edit Game_
  (`Ctrl+Shift+Y`), _Edit as JSON_ (`Ctrl+J`) and _Find Field_
  (`Ctrl+Shift+T`).
- **View**: reload, developer tools, _App Information_ (`Ctrl+U`), _Paginate_
  (`Ctrl+Shift+P`), _Config_ (`Ctrl+Shift+C`), _Reset View_ (`Ctrl+Shift+V`),
  _Toggle Sidebar_ (`Ctrl+B`), zoom and full screen.
- **Go**: _Home_ (`Ctrl+Shift+H`), _Load Games_ (`Ctrl+L`), _Current Game_
  (`Ctrl+Shift+N`), the previous and next section or page (`Ctrl+PageUp` and
  `Ctrl+PageDown`), the sections of a game (`Ctrl+1` to `Ctrl+9`, the last one
  has no key) and the _Elements_ pages.
- **Window**: the window commands of your system.
- **Help**: _Documentation_ (`Ctrl+D`), _Elements_ (`Ctrl+E`) and _Keyboard
  Shortcuts_.

The menu follows the language of the app.

On macOS there is also the menu named after the app, with About and Quit. The
shortcuts that work inside the pages are listed under
[Keybindings](/docs#keybindings).

## App Info

_App Information_ (in the _View_ menu, or `Ctrl+U`) shows:

- the versions of your system, Electron, Chrome and 18xx Maker you are running,
- the updates (below),
- the file where the app keeps what it needs to work: the games you opened, the
  recent games and the last page you used, with its current contents.

### Updates

The app checks for a new version when it starts. When one is available the
sidebar shows _Update to_ the new version, and the _Updates_ box on the App Info
page has a _Download and install update_ button. The app installs it and
restarts. The _Check for updates_ button looks again. In a development build
updates are turned off.

## Load Games

The [Load Games](/games) page lists the games you opened (_Your games_), the
bundled games and the test games. The _Open File_ button opens a game file. Three
filters narrow the list:

- _Publisher_ and _Designer_: a game with several designers is listed under each
  of them,
- _Type_: _Bundled_ or _Loaded_. It only shows once you have loaded a game.

A filter set to _All_ does nothing. The trash icon of a game you loaded makes
the app forget it, it does not delete your file.

## Settings

The [Settings](/settings) page (in the sidebar) has:

- **Theme**: _System_, _Light_ or _Dark_. Exports are always light, see the
  [questions and answers](/docs/faq).
- **Language**: _System_ or one of the available languages. The page shows the
  language it detected, and which one it falls back to when yours is not
  available. See [Translation](/docs/translation).
- **Open the folder after exporting**: in the app only. When an export is done,
  the files are shown in your file manager.
