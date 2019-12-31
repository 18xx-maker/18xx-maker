# Map Borders

On maps defining borders in each hex was very inefficient and time consuming. I
also didn't like the way it looked, so a new method for borders is available on
maps. The old method should still be used for tiles that needed borders.

## Example

Here are the borders from 1830:

```json
{
  "map": {
    "borders": [{
      "color": "water",
      "coords": ["F7", "F8"]
    },{
      "color": "water",
      "coords": ["D11", "D12", "D13"]
    },{
      "color": "water",
      "coords": ["C16", "C17"]
    }]
  }
}
```

## Coordinates

When writing coordinates you use the letter for the top (or on horizontal maps,
the left) of the hex you want. Numbers already uniquely determine coordinates so
they are just used directly.

## Options

Here is a definition using every option.

```json
{
  "map": {
    "borders": [{
      "color": "mountain",
      "type": "dashed",
      "offset": 4,
      "border": false,
      "width": 8,
      "borderWidth": 12,
      "coords": ["F7", "F8"]
    }
  }
}
```

That is the default `width` and `borderWidth`. If you set `border` to `false`
then setting `borderWidth` doesn't really matter. If you set `type` to `dashed`
you can set an `offset` that helps you position the dashes to be pretty.
