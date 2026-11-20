# Online Play

18xx Maker can put the game you have open on a play server, so you and your
friends can move tiles, tokens and market markers on one shared board from
different computers. Every move shows up for everyone at the board within a
moment.

Online play needs a play server. Someone runs one (see [Running a play
server](/docs/play-server)) and gives you its address.

## What online play is

Online play is a shared table, not a game engine. It does not know the rules
of the game:

- Nothing is enforced. Any player can place any tile on any hex, move any
  token or marker and take anything from the bank.
- There is no turn order. Everybody can move at any time.
- The trays (what each player and the bank hold) are shared. Taking only what
  is yours is the honor system.
- Anyone in the game can undo any move, their own or someone else's.
- The log is permanent. Every move, every undo and every change of the notes
  is kept in the history of the game, and an undo only cancels a move, it does
  not erase it.

Play it like a game on a real table: agree on the rules and on who moves next
in your chat.

## Setting the play server

Open [Settings](/settings) from the sidebar and enter the address of the
server under **Play server**, for example `https://play.example.com`. Leave the
field empty to turn online play off. The website can reach any server on
`https://`; a plain `http://` address works only for a server on your own
computer (`localhost`).

## Signing in

Open **Play** in the sidebar and choose **Sign in with Discord**. Discord asks
you to allow the play server to see your name and your servers, then sends you
back to 18xx Maker. Every player needs a Discord account, also to join a game.

A sign in lasts as long as the server allows (30 days unless the server says
otherwise). After that the board says that your sign in has expired: sign in
again. **Sign out** on the Play page ends the sign in on this browser.

## Creating a game

Load the game you want to play first (from [Load games](/games) or by opening
a file), then go to **Play** and use **Create a game**. Enter the name the
other players see and choose **Create game**.

The game file, your config and the custom images of the game (see [Custom
Images](/docs/games/images)) are uploaded to the server, so the other players
do not need the file. Changing the file afterwards does not change the online
game: create a new one for a new version.

The server has limits:

- Each image may be at most 1 MB. A larger image is named before anything is
  uploaded, and no game is created.
- The server also caps the size of the game file, the number of images and
  their total size, and how many games you may own. The defaults are 2 MiB, 50
  images, 8 MiB and 50 games, but the server's owner can change them.
- The server checks the game file. A file with errors is refused and the errors
  are listed: fix them (see [JSON Schemas](/docs/games/schemas)) and try again.
- A server can let only the members of one Discord server create games. If you
  may not create games, you can still join with an invite link.

## Inviting players

When the game is created you are its owner. Use **Copy invite link** in the
owner menu on the board and send the link to the other players. Opening the
link shows the game's title; a player signs in, enters a name, picks a color
and chooses **Join game**. **Your games** on the Play page lists every game you
have a seat in.

Anyone with the invite link can join while the game is active, so share it
only with your players. **New invite link** makes a new one and the old link
stops working; players who already joined keep their seats.

## The board

The board has the map (or the market) on one side and the tools in tabs on the
other. The badge next to the title says whether you are online. When the
connection drops the board reconnects by itself and catches up on the moves it
missed.

### Tiles

Choose a tile, turn it with **Rotate left** and **Rotate right**, then click a
hex to place it. Click a hex to select it, then rotate or remove its tile.
Every tile shows how many are left. When none are left the tile says so, and
placing it anyway goes over the supply (the board warns you, but does not stop
you).

### Tokens

Choose a company, then click a spot on a hex to place its token. The list
shows how many tokens of each company are placed, and warns when a company has
none left. Click a token to select it and remove it.

### Market

Choose a company, then click a cell of the stock market to move its marker
there.

### Trays

Every player has a tray, and so does the bank. Trays hold companies and tiles.
New items come from the bank: use **Add from the bank** on a tray, and move an
item from one tray to another with **Move**.

### Notes

The notes are one text that everyone in the game sees, for cash, share counts
or anything else the board does not track. They are saved when you leave the
field and can have at most 10,000 characters.

### History and undo

The **History** tab lists every move, newest first, with who made it. **Undo**
cancels the newest move that is still in effect, whoever made it, and the
history strikes it through. An undo is a move too: pressing **Undo** right
after an undo brings the move back.

### Who is online

The initials next to the title are the players at the board right now, in
their seat colors. Point at one to see the name.

## Owner controls

The owner of a game has the owner menu on the board:

| Entry                 | What it does                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Copy invite link      | Copies the invite link.                                                                                                     |
| New invite link       | Makes a new invite link. The old one stops working.                                                                         |
| Spectator link        | Makes and copies the spectator link (see below).                                                                            |
| Discord notifications | Sends the moves of the game to a Discord channel (see below).                                                               |
| Lock game             | Makes the game read only: nobody can move and nobody new can join. Use it for a break or when the game is over.             |
| Unlock game           | Opens a locked game again.                                                                                                  |
| Archive game          | Puts the game away. It is read only and does not count against the number of games you may own.                             |
| Reopen game           | Makes an archived game active again. This counts against your games again.                                                  |
| Delete game           | Deletes the game for everyone, with its moves and notes. This cannot be undone, and the board asks before it does anything. |

## Spectator link

A spectator link lets people watch a game without signing in, for example a
stream or friends who are not playing. A spectator sees the board and every
move as it happens, but cannot change anything and is not shown among the
players.

Choose **Spectator link** in the owner menu to make the link and copy it.
**New spectator link** replaces it and **Stop spectator link** turns it off.
Both end the old link at once, also for everyone watching with it. Locked and
archived games stay watchable. A server allows a limited number of spectators
per game (50 by default); past that the page asks to try again later.

Treat the link like the invite link: anyone who has it can watch.

## Discord notices

The owner can have the moves of a game posted to a Discord channel:

1. In Discord, open the settings of the channel, then **Integrations**,
   **Webhooks**, **New Webhook**, and choose **Copy Webhook URL**.
2. On the board, open **Discord notifications** in the owner menu, paste the
   URL and choose **Save**. The channel gets "Notifications connected".

From then on every move becomes one line, like "Alice placed tile 7 on A1".
The lines are collected for a few seconds and posted together, so a busy
channel gets a few messages instead of many. A change of the notes is posted
as "Alice updated the notes", never with their text. Nobody is mentioned.

The URL is kept on the server and never shown again, not even to the owner.
To turn the notices off, open **Discord notifications** and choose **Remove**.
Deleting the webhook in Discord also stops them.

## Desktop app

Online play is available on the website only. The [desktop app](/docs/app)
shows the Play page with a note to use the website.

## Known limits

- The other players do not see a lock or an unlock right away. After a lock
  their next move is refused and their board turns read only; after an unlock
  they see the game open again only when they reload the page.
- The board does not check anything about the game (see [What online play
  is](#what-online-play-is)).
- A game is a copy of the game file at the time it was created. Changes to the
  file need a new game.
