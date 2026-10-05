# Auto Positioning

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
positioning field (`angle`, `percent`, `rotate`, `rotation`, `side`, `x` or `y`)
to that element. For example adding `"angle": 0` will effectively turn off auto
positioning while leaving the element in the middle of the hex. It only turns it
off for that element, the other elements of the hex are still positioned.

Every rule below is drawn live, with its JSON, on the [Auto
Positioning](/elements/positioning) examples page.

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
