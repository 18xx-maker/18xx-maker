# Kartenränder und Linien

Auf Karten war es sehr ineffizient und zeitaufwendig, Ränder in jedem
Kartenfeld einzeln zu definieren. Außerdem gefiel mir die Optik nicht, daher
gibt es für Karten jetzt eine neue Methode für Ränder. Die alte Methode sollte
weiterhin für Plättchen verwendet werden, die Ränder brauchen. Außerdem kannst
du damit beliebig breite Linien über deine Karte zeichnen, zum Beispiel für
Flüsse und anderes.

## Koordinaten

Jede Koordinate kannst du auf folgende Arten angeben:

- `A5x10y20` - X- und Y-Koordinate (10, 20) ab der Mitte von Kartenfeld A5.
- `A5a30p0.5` - Halber Weg (0.5) von der Mitte zur Seite im Winkel 30 von
  Kartenfeld A5. Das ähnelt der
  [Positionierung](/docs/games/positioning#koordinaten) bei den meisten Plättchen.
- `A5s1` - Mitte von Seite 1 von Kartenfeld A5.
- `A5p2` - Zweiter Punkt von Kartenfeld A5.

Ränder lassen sich leicht über die Punktkoordinaten zeichnen. Die Stile können
in einem einzigen Rand gemischt werden:

```json
{ "color": "water", "coords": ["A15s1", "A15a30p0.5", "A15x10y20", "A15p2"] }
```

## Beispiel

Hier sind zwei der Flüsse aus der Karte von 1867 (die vollständige Karte hat
mehr):

![Zwei blaue Flussgrenzen entlang der Kanten beiger Kartenfelder](/images/borders-example.png "Grenzen folgen den Kanten und Ecken von Kartenfeldern, statt zu einem einzelnen Feld zu gehören.")

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

Du kannst auch das Feld `lines` verwenden (gleiche Syntax), um Ränder von
anderen beliebigen Linien auf deiner Karte besser zu trennen. Zum Beispiel:

```json
{
  "map": {
    "lines": [
      { "color": "mountain", "dashed": true, "coords": ["A15p1", "A15p4"] }
    ]
  }
}
```

## Optionen

Hier ist eine Definition, die jede Option verwendet.

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

Das sind die Standardwerte für `width` und `borderWidth` (`borderWidth` ist
standardmäßig `width` plus 4). Wenn du `border` auf `false` setzt, spielt
`borderWidth` keine Rolle mehr. Wenn du `dashed` auf `true` setzt, kannst du
einen `offset` angeben, mit dem du die Striche hübsch ausrichtest, und mit
`dashArray` die Strichlänge festlegen. `dashArray` funktioniert nur bei
`borders`, nicht bei `lines`.

## Plättchenränder

Die `borders` eines Plättchens zeichnen eine farbige Linie entlang einer `side`
des Feldes. Mit `strokeWidth` legst du die Dicke der Linie fest (Standard ist
10). Die `width` eines Plättchenrands ist nur die Strichlänge eines
gestrichelten (`dashed`) Rands, halte die Striche also länger als die Dicke.

```json
{
  "borders": [
    { "side": 1, "color": "blue", "strokeWidth": 4 },
    { "side": 2, "color": "red", "dashed": true, "strokeWidth": 4, "width": 24 }
  ]
}
```
