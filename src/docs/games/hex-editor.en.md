# Hex Editor

The edit panel draws a hex, lists what is on it and gives every element its
own fields, so you can build a hex or a tile without writing its JSON. The
**Hex** tab edits the group of the map you picked (see [Files](/docs/files)),
the **Tiles** tab edits a tile of the game. They are the same editor, and both
write the same [hex definition](/docs/games/tiles) as the game file has it.

The editor writes only what you change. Keys it does not know, the order of
the keys, and values you wrote in short form (a label that is just text, a
number) stay as they are, and nothing is filled in with a default. The page
follows every change, and the printed and exported pages do not depend on the
editor.

## The Drawing

The top of the editor draws the hex as the map does, with a button on each
edge, numbered like the sides in the file (1 is the bottom side of a hex that is
not turned). Click one edge and then another to draw the track between them;
click the same edge again or press Escape to cancel. Two sides that face each
other make a `straight` track, sides one apart a `sharp` curve and sides two
apart a `gentle` curve. The new track is picked, so its fields show up below.

Click an element on the drawing to pick it. The edge buttons, the elements and
the buttons below all work from the keyboard.

## The Element List

Below the drawing, the list has a row for each element of the hex. Pick a row
to edit it, or use the buttons of the row to move it up or down (the order is
the order of drawing), to copy it or to remove it. The last element of a kind
takes the whole list from the hex with it. _Add an element_ at the bottom adds
a new one of any kind that has fields.

## The Inspector

The picked element shows its fields in the inspector. The main ones are in
view, the others are behind _More fields_ (the placement fields, `side`,
`angle`, `x`, `y`, `percent` and the like, are there; see
[Positioning](/docs/games/positioning)). _As JSON_ shows the element as text,
which also keeps anything the form does not have. The fields, their names and
their help come from the [JSON schemas](/docs/games/schemas), so a field added
to the schema shows up without a new version of the editor.

Some elements have a control that fits them better than a field:

| Element                        | Main fields                            | Control                                 |
| ------------------------------ | -------------------------------------- | --------------------------------------- |
| Track                          | type, gauge, width, color              | a drawing to pick the sides it joins    |
| City, medium city              | size, name, companies                  |                                         |
| Town, center town, boomtown    | name                                   |                                         |
| Offboard revenue               | name, revenues, rows                   |                                         |
| Label                          | label, size, color                     |                                         |
| Border                         | color, dashed, width                   | a drawing to pick its side              |
| Divide, tunnel entrance        |                                        | a drawing to pick its side              |
| Value, name, route bonus       | the text or the number                 |                                         |
| Icon                           | width, no circle                       | a list of the icons that 18xx Maker has |
| Terrain                        | cost, size                             | a list of the terrain types and icons   |
| Shape, good, industry, company | text, colors, `top`, `bottom`, `label` |                                         |
| Bridge, tunnel                 | cost, color, text color                |                                         |

A name in the type list that 18xx Maker does not have, such as the name of an
icon of your own, is kept and shown. A token is text, a number or one of several
kinds of object, so it has no fields: edit it as JSON in the inspector.

## The Hex Itself

Under the inspector are the fields of the hex: its color, the `half` of a hex
that is cut, the `stripeRotation` and the sides whose borders are removed
(click the sides on the small drawing). In the Tiles tab the same place has the
fields about printing a tile: the quantity, how many are printed and the group.

## Moving Elements

Drag a city, town, label, icon or any other element that sits by a place to
move it. The drag changes its `x` and `y` (to a tenth), whatever else places it,
and an element the map places by itself gets the place it has so it does not
jump. Track, borders and the other elements that sit on an edge cannot be
dragged: use their drawing in the inspector.

## Undo and Redo

The two buttons under the drawing, Ctrl or Cmd+Z and Ctrl or Cmd+Shift+Z
(also Ctrl or Cmd+Y) undo and redo changes made in the editor. A drag is one
step. The shortcuts do not work while the focus is in a field, where the keys
are the field's own, and the history starts over for each hex and when you
leave the editor for the JSON view and come back.

## Changing One Hex of a Group

A group of the map is a list of coordinates that share one definition, so a
change in the Hex tab applies to all of them, and a note says how many. The
button _Edit C11 only_ (with the coordinate of the hex) takes the hex out of
the group and gives it a copy of the group of its own, right after the original
so that the drawing order of the groups stays. After that your changes are for
that hex only. To put a hex back in a group, Cmd-click (Ctrl on Windows and
Linux) the map as described in [Files](/docs/files). If another group also
lists the hex, a note says so and the group shown is the one drawn on top.

## JSON

Everything the form does not have stays in the JSON. Use the _Form_ and _JSON_
switch of the Hex tab to change the group as text: the text opens from the
group each time. The form cannot be shown while the text is not valid JSON of a
group.
