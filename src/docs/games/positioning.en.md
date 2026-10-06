# Positioning

Every element on a tile (cities, towns, values, labels, icons, terrain, ...) is
placed with the same small set of fields. This page explains them in the order
you need them. Every step is drawn live, with its JSON, on the
[Positioning](/elements/positioning) examples page.

1. [Coordinates](#coordinates): where 0 is and which way things go.
2. [Placing](#placing): `angle`, `percent`, `x` and `y`.
3. [Turning](#turning): `rotation`, `rotate` and `side`.
4. [Named Positions](#named-positions): `mid` and `align`.
5. [Hiding](#hiding): `hidden`.
6. [Auto Positioning](#auto-positioning): where things go when you say nothing.
7. [Draw Order](#draw-order): `order`.

Setting any placement field on an element turns auto positioning off for that
element, see [Turning It Off](#turning-it-off).

## Which Elements Can Be Positioned

These tile elements take the fields on this page: `track`, `cities`, `towns`,
`centerTowns`, `boomtowns`, `mediumCities`, `labels`, `icons`, `names`, `shapes`,
`terrain`, `bridges`, `tunnels`, `tunnelEntrances`, `divides`, `values`,
`goods`, `companies`, `tokens`, `routeBonuses`, `industries` and
`offBoardRevenue`. `track` and `divides` have no `order`. `borders` only take
`side`.

## Coordinates

The origin is the center of the hex. Every position is measured from it, in
units where the middle of an edge is 75 away from the center (a hex is 150 units
from flat edge to flat edge). The first
[example](/elements/positioning#place) marks angle 0, 90, 180 and 270.

- `angle` is a direction in degrees, **clockwise on the screen**: 0 is straight
  down, 90 is left, 180 is up and 270 is right.
- `percent` is how far along that direction, as a fraction of 75 units: 0 is the
  center and 1 is 75 units out.
- `x` and `y` are plain screen units: `x` goes right and `y` goes down.

Angles are directions on the screen, not directions of the hex. On a tile and on
a `horizontal` map the middle of an edge is at angle 0, 60, 120 and so on, so
`percent` 1 is exactly on an edge. On the default `vertical` map the hex is
turned by 90 degrees: angle 0 points at a corner (about 86.6 units away) and the
middles of the edges are at angle 30, 90, 150 and so on. Only `mid` (see
[Named Positions](#named-positions)) follows that turn by itself.

## Placing

- `angle` (-360 to 360, exclusive, default 0) and `percent` (0 or more, default 0) put the element: first turn by `angle`, then go out by `percent`.
- `x` and `y` (default 0) then move it by plain screen units. They are not
  turned by `angle` or by any rotation, so `"x": 10` is always 10 units to the
  right.

```json
{
  "labels": [{ "label": "B", "angle": 90, "percent": 0.6, "x": 5 }]
}
```

([examples](/elements/positioning#place))

A `percent` above 1 goes past the edge of the hex. Most elements are cut off at
the edge of the hex, so you only see the part inside. Elements that are drawn
outside of it are not cut off: `names`, outside `cities`, `shapes` that are not
`background`, `bridges`, `tunnels`, `offBoardRevenue`, `industries`, `companies`
and `routeBonuses`.

## Turning

- `rotation` and `rotate` (-360 to 360, exclusive) turn the element on its own
  spot, clockwise, in degrees. They are the same field with two names. Use only
  one of them: a `rotate` that is not 0 wins over `rotation`, and `"rotate": 0`
  falls back to `rotation`. They are never added together.
- `side` (1 to 6) without `mid` turns the element by (side - 1) sixths of a
  turn, so side 1 is unturned and side 2 is 60 degrees. It only turns the
  element and does not move it. It adds to `rotation` or `rotate`. With `mid` it
  moves the named point instead, see [Named Positions](#named-positions).

```json
{
  "towns": [{ "rotation": 45 }]
}
```

([examples](/elements/positioning#turn))

Not everything turns the same way, because text should stay readable:

| Element                                | `rotation`                         | `rotate` and `side` |
| -------------------------------------- | ---------------------------------- | ------------------- |
| towns, cities (and their names), icons | turns                              | turns               |
| labels, values, terrain                | stays upright, so you see no turn  | turns               |
| tokens                                 | turns twice as far (the label too) | turns               |

Use `rotate` or `side` when you want the text of a label, value or terrain to
turn, and `rotate` to turn a token. `"fixed": true` on a token turns it exactly
as far as the element, whichever of the three fields you use.

With `mid`, the text of labels, values and terrain stays upright whichever
field you use.

## Named Positions

Instead of working out an `angle` and `percent`, an element can name a point on
track with `mid` and turn to the track there with `align`. They work on every
element that has a position (towns, centerTowns, values, labels, icons, ...).
The point is for track that starts on side 1, move it to another side with
`side`.

- `mid` is the midpoint of a track type. Only these full length track types are
  named:

  | `mid`      | `angle` | `percent` |
  | ---------- | ------- | --------- |
  | `straight` | 0       | 0         |
  | `sharp`    | 30      | 0.577     |
  | `gentle`   | 60      | 0.268     |

- `side` with `mid` moves the point like a track that starts on that side, so a
  `gentle` on side 3 is at `angle` 180. This is the one place `side` moves
  something, without `mid` it only turns the element.
- `align` is `perpendicular` or `parallel` to the track at the point. It needs a
  `mid`. A town bar on a `sharp` is `perpendicular` with a `rotation` of 120, on
  a `gentle` 150. `rotate` and `rotation` are added to it as an offset.
- An explicit `angle` or `percent` replaces the value from `mid`, and `x` and
  `y` nudge from it.
- On a `vertical` map the track is drawn turned by 90 degrees and `mid` turns
  with it, so it lands on the track. A written `angle` or `percent` does not
  turn.

```json
{
  "track": [{ "type": "gentle", "side": 1 }],
  "towns": [{ "mid": "gentle", "align": "perpendicular" }]
}
```

([examples](/elements/positioning#named))

## Hiding

`hidden` (`true`) does not draw the element. The other elements keep their
positions: a hidden element still counts for
[Auto Positioning](#auto-positioning), so the second label stays the second
label.

```json
{
  "labels": [{ "label": "B", "hidden": true }, { "label": "NY" }]
}
```

([examples](/elements/positioning#hide))

## Auto Positioning

Auto positioning puts the common 95% of elements in a standard place so you do
not have to. It is not meant to be complete. It looks at each element on its
own: an element is auto positioned when it has none of `angle`, `percent`,
`rotate`, `rotation`, `side`, `mid`, `align`, `x` or `y`. `hidden` and `order`
do not count.

| Element | Which ones  | Where (`angle`, `percent`)                | Only when                          |
| ------- | ----------- | ----------------------------------------- | ---------------------------------- |
| values  | the first   | 210, 0.7 (upper right)                    | always                             |
| labels  | the first   | 150, 0.7 (upper left)                     | always                             |
| labels  | the second  | 270, 0.7 (right)                          | always                             |
| icons   | all of them | 0, 0.6, or 30, 0.6 if the hex has terrain | the hex has a city or a centerTown |
| terrain | all of them | 0, 0.7, or 330, 0.7 if the hex has icons  | the hex has a city or a centerTown |

"The first" means the first entry of that array, counting every entry: a hidden
or hand positioned first label still uses up the first spot, so the next label
is the second and goes to 270. Other values and labels are not moved. Several
icons (or several terrain) are all moved to the same spot and overlap, so give
all but one of them a position.

([examples](/elements/positioning#auto))

### Turning It Off

To keep an element out of auto positioning, give it one placement field. For
example `"angle": 0` effectively turns it off while leaving the element in the
middle of the hex. It only turns it off for that element, the other elements of
the hex are still positioned.

```json
{
  "cities": [{}],
  "terrain": [{ "type": "mountain", "cost": 60, "angle": 0 }]
}
```

([examples](/elements/positioning#off))

## Draw Order

Position only says where an element sits. Which element is drawn on top of which
follows a fixed order by type (cities, then values, labels, tokens, terrain and
icons, and so on). To change it, give an element an `order`. It is drawn after
all the elements of its tile that have none, lowest `order` first, and its
position does not change. For example, to draw a city over a value:

```json
{
  "cities": [{ "order": 1 }],
  "values": [{ "value": 30, "x": 0, "y": 0 }]
}
```

([examples](/elements/positioning#order))

- A negative number draws the element before all the others, `true` draws it
  last, and `0` draws it after the elements without an `order`.
- Elements with the same `order` keep the usual order by type.
- An element stays on its side of the tile border and ID: a hex's inner
  elements cannot go over the border, and elements drawn outside (like outside
  cities or names) cannot go under it.
- It can cover track.
- Track, divides and borders do not have an `order`.

The tile elements themselves are described in [Tiles and Hexes](/docs/games/tiles#elements).
