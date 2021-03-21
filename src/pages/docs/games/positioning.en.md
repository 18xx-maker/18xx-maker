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

If you did want to turn off auto positioning for an element just add a single
positioning field to that element. For example adding `"angle": 0` will
effectively turn off auto positioning while leaving the element in the middle of
the hex.

## Rules

### Icons

Icons (when on a tile with a single city of centerTown) are moved to:

```
{
    "angle": 0,
    "percent": 0.6
}
```

If there is also a terrain cost than the terrain is shifted left to:

```
{
    "angle": 30,
    "percent": 0.6
}
```

### Values

The first value of every tile is auto positioned to the upper right corner:

```
{
    "angle": 210,
    "percent": 0.7
}
```

### Labels

The first label on a tile is auto positioned to the upper left corner:

```
{
    "angle": 150,
    "percent": 0.7
}
```

The second label on a tile is auto positioned to the right side:

```
{
    "angle": 270,
    "percent": 0.7
}
```

### Terrain

Terrain costs (when on a tile with a single city or centerTown) are moved to:

```
{
    "angle": 0,
    "percent": 0.7
}
```

If there is also an icon than the terrain is shifted right to:

```
{
    "angle": 330,
    "percent": 0.7
}
```
