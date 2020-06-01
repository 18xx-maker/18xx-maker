# Map Borders and Lines

On maps defining borders in each hex was very inefficient and time consuming. I
also didn't like the way it looked, so a new method for borders is available on
maps. The old method should still be used for tiles that needed borders. This
also allows you to draw any arbitrary width lines over your map. This can be
used for rivers and other things.

## Coords

You can specify each coordinate in the following ways:

* `A5x10y20` - X and Y coordinate (10, 20) from the center of hex A5.
* `A5a30p0.5` - Half of the way (0.5) from the center to the side at angle 30 of
  hex A5. This is simular to most tile positioning.
* `A5s1` - Middle of side 1 from hex A5.
* `A5p2` - Second point of hex A5.

Borders can be drawn easily by using the point coordinates

## Example

Here are the borders from 1830:

```json
{
  "map": {
    "borders": [{
      "color": "water",
      "coords": ["F8p3", "F8p4"]
    },{
      "color": "water",
      "coords": ["D12p3", "D12p4", "D12p5"]
    },{
      "color": "water",
      "coords": ["C17p3", "C17p4"]
    }]
  }
}
```

You can use the `lines` field as well (same syntax) just to help separate
borders from other random lines in your map.

## Options

Here is a definition using every option.

```json
{
  "map": {
    "borders": [{
      "color": "mountain",
      "dashed": true,
      "offset": 4,
      "border": false,
      "width": 8,
      "borderWidth": 12,
      "coords": ["F8p3", "F8p4"]
    }
  }
}
```

That is the default `width` and `borderWidth`. If you set `border` to `false`
then setting `borderWidth` doesn't really matter. If you set `dashed` to `true`
you can set an `offset` that helps you position the dashes to be pretty.
