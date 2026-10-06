# Positioning

Every element on a tile (cities, towns, values, labels, icons, terrain, ...) can
be positioned with the same set of fields. When an element has none of them, the
auto positioning system puts a few common elements in a standard place.

## Options

All of these are optional and work on every element that has a position
([examples](/elements/positioning#basic)):

- `angle` (-360 to 360, exclusive) is the direction from the center of the hex
  to put the element, in degrees. 0 is straight down and it turns clockwise.
- `percent` (0 or more) is how far out along that `angle`: 0 is the center and 1
  is the middle of the hex edge.
- `x` and `y` move the element in plain units from where `angle` and `percent`
  put it.
- `rotation` (-360 to 360, exclusive) turns the element on its own spot, in
  degrees. `rotate` is the same field with a shorter name.
- `side` (1 to 6) rotates the element by that many sixths of a turn, so side 2
  turns it 60 degrees. With `mid` it moves the named point instead, see [Named
  Positions](#named-positions).
- `mid` and `align` place and turn the element by the track, see [Named
  Positions](#named-positions).
- `hidden` (`true`) does not draw the element. The other elements keep their
  positions.

```json
{
  "labels": [{ "label": "B", "angle": 90, "percent": 0.6, "x": 5 }],
  "towns": [{ "side": 2 }]
}
```

## Auto Positioning

The auto position system will auto apply positioning to items that it finds
according to some very simple rules. This system is NOT meant to be all
complete, it's only meant to help with the common 95% case of positioning.

For example: 18xx-maker has a certain standard that it likes to apply for simple
tiles. If you have a map hex with a single city and a terrain cost, the auto
positioning will put the terrain cost into the "standard" position as long as
there is no other positioning data on the hex. If you want to position your
elements custom, go right ahead, this should only provide sane defaults for when
you don't.

If you did want to turn off auto positioning for an element just add one
positioning field (`angle`, `percent`, `rotate`, `rotation`, `side`, `mid`, `align`, `x` or
`y`)
to that element. For example adding `"angle": 0` will effectively turn off auto
positioning while leaving the element in the middle of the hex. It only turns it
off for that element, the other elements of the hex are still positioned.

Every option and every rule is drawn live, with its JSON, on the
[Positioning](/elements/positioning) examples page.

## Rules

### Icons

Icons (when on a tile with a city or a centerTown) are moved to
([examples](/elements/positioning#icons)):

```json
{
  "angle": 0,
  "percent": 0.6
}
```

If there is also a terrain cost then the icon is shifted left to:

```json
{
  "angle": 30,
  "percent": 0.6
}
```

### Values

The first value of every tile is auto positioned to the upper right corner
([examples](/elements/positioning#values)). Other values are not moved:

```json
{
  "angle": 210,
  "percent": 0.7
}
```

### Labels

The first label on a tile is auto positioned to the upper left corner
([examples](/elements/positioning#labels)):

```json
{
  "angle": 150,
  "percent": 0.7
}
```

The second label on a tile is auto positioned to the right side. Other labels
are not moved:

```json
{
  "angle": 270,
  "percent": 0.7
}
```

### Terrain

Terrain costs (when on a tile with a city or a centerTown) are moved to
([examples](/elements/positioning#terrain)):

```json
{
  "angle": 0,
  "percent": 0.7
}
```

If there is also an icon then the terrain cost is shifted right to:

```json
{
  "angle": 330,
  "percent": 0.7
}
```

## Named Positions

Instead of working out an `angle` and `percent`, a tile element can name a point
on track with `mid` and turn to the track there with `align`. They work on every
element that has a position (towns, centerTowns, values, labels, icons, ...).
Like any other positioning field they turn auto positioning off for that
element. Every point is for track that starts on side 1, move it to another side
with `side`.

- `mid` is the midpoint of a track type: `straight` (`angle` 0, `percent` 0, the
  center), `sharp` (`angle` 30, `percent` 0.577) or `gentle` (`angle` 60,
  `percent` 0.268).
- `side` with `mid` turns the point like a track that starts on that side, so a
  `gentle` on side 3 is at `angle` 180. Without `mid`, `side` keeps rotating the
  element.
- `align` is `perpendicular` or `parallel` to the track at the point. A town bar
  on a `sharp` is `perpendicular` with a `rotation` of 120, on a `gentle` 150.
  `rotate` and `rotation` are added to it as an offset.
- An explicit `angle` or `percent` replaces the value from `mid`, and `x` and
  `y` nudge from it.

```json
{
  "track": [{ "type": "gentle", "side": 1 }],
  "towns": [{ "mid": "gentle", "align": "perpendicular" }]
}
```

([examples](/elements/positioning#named))

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

- A negative number draws the element before all the others, `true` draws it
  last, and `0` draws it after the elements without an `order`.
- Elements with the same `order` keep the usual order by type.
- An element stays on its side of the tile border and ID: a hex's inner
  elements cannot go over the border, and elements drawn outside (like outside
  cities or names) cannot go under it.
- It can cover track.
- Track, off board track, divides and borders do not have an `order`.
