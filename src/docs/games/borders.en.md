# Map Borders and Lines

On maps defining borders in each hex was very inefficient and time consuming. I
also didn't like the way it looked, so a new method for borders is available on
maps. The old method should still be used for tiles that needed borders. This
also allows you to draw any arbitrary width lines over your map. This can be
used for rivers and other things.

## Coords

You can specify each coordinate in the following ways:

- `A5x10y20` - X and Y coordinate (10, 20) from the center of hex A5.
- `A5a30p0.5` - Half of the way (0.5) from the center to the side at angle 30 of
  hex A5. This is similar to most tile
  [positioning](/docs/games/positioning#coordinates).
- `A5s1` - Middle of side 1 from hex A5.
- `A5p2` - Second point of hex A5.

Borders can be drawn easily by using the point coordinates. The styles can be
mixed in a single border:

```json
{ "color": "water", "coords": ["A15s1", "A15a30p0.5", "A15x10y20", "A15p2"] }
```

## Example

Here are two of the rivers from the 1867 map (the full map has more):

![Two blue river borders drawn along the edges of beige map hexes](/images/borders-example.png "Borders follow hex edges and corners instead of belonging to a single hex.")

```json
{
  "map": {
    "borders": [
      {
        "color": "water",
        "coords": ["C13p2", "C13p3"]
      },
      {
        "color": "water",
        "coords": ["C11p2", "C11p3", "C11p4", "D12p3", "D12p4"]
      }
    ]
  }
}
```

You can use the `lines` field as well (same syntax) just to help separate
borders from other random lines in your map. For example:

```json
{
  "map": {
    "lines": [
      { "color": "mountain", "dashed": true, "coords": ["A15p1", "A15p4"] }
    ]
  }
}
```

## Options

Here is a definition using every option.

```json
{
  "map": {
    "borders": [
      {
        "color": "mountain",
        "dashed": true,
        "dashArray": 20,
        "offset": 4,
        "border": false,
        "width": 8,
        "borderWidth": 12,
        "coords": ["F8p3", "F8p4"]
      }
    ]
  }
}
```

That is the default `width` and `borderWidth` (`borderWidth` defaults to
`width` plus 4). If you set `border` to `false`
then setting `borderWidth` doesn't really matter. If you set `dashed` to `true`
you can set an `offset` that helps you position the dashes to be pretty, and
`dashArray` to set the dash length. `dashArray` only works on `borders`, not on
`lines`.

## Tile borders

The `borders` of a tile draw a colored line along one `side` of the hex. Set
`strokeWidth` for the thickness of the line (the default is 10). The `width` of
a tile border is only the dash length of a `dashed` border, so keep the dashes
longer than the thickness.

```json
{
  "borders": [
    { "side": 1, "color": "blue", "strokeWidth": 4 },
    { "side": 2, "color": "red", "dashed": true, "strokeWidth": 4, "width": 24 }
  ]
}
```
