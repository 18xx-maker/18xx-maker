# Aktienmarkt und Par-Tabelle

Das Feld `stock` einer Spieldatei enthält den Aktienmarkt, die Par-Tabelle und
die dazugehörigen Legenden. Die Seiten [Aktienmarkt](/games/18Test/market),
[Par](/games/18Test/par) und [Einnahmen](/games/18Test/revenue) zeichnen sie, siehe
[Spielseiten](/docs/games/pages). `18Test.json` enthält ein Beispiel für fast
alles, was hier beschrieben wird, und das Schema steht unter
[JSON-Schemas](/docs/games/schemas).

```json
{
  "stock": {
    "type": "2D",
    "market": [
      [
        { "value": 60, "legend": 0, "arrow": "down" },
        67,
        71,
        { "value": 76, "par": true }
      ],
      [null, 60, 66, { "value": 70, "arrow": "up" }]
    ],
    "par": { "values": [76, 71, 67] },
    "legend": [
      { "color": "yellow", "description": "Does not count toward the limit" }
    ],
    "movement": { "up": ["Sold out"], "right": ["Paid dividends"] },
    "display": { "movement": { "x": 5, "y": 0 } }
  }
}
```

## Markttyp

`stock.type` ist `2D`, `1D` oder `1Diag`. Setze es immer: Ein Aktienmarkt ohne
Typ ist leer.

- `2D` ist ein Raster. `stock.market` ist eine Liste von Zeilen. Zeilen dürfen
  unterschiedlich lang sein und mit `null`-Zellen beginnen, ein Dreieck braucht
  also keine Auffüllung.
- `1D` ist eine einzelne Zeile, `stock.market` ist eine Liste von Zellen. Eine
  Zelle ist so hoch wie die Spaltenhöhe der Konfiguration (standardmäßig 4
  Zellen), ihre Beschriftung wird gedreht gezeichnet, und die Kürzel ihrer
  `companies` stehen auf ihren Balken.
- `1Diag` ist eine Zickzack-Zeile. Die Zellen liegen eine halbe Zelle auseinander
  und jede zweite liegt eine Zellenzeile tiefer, jede so hoch wie die
  Diag-Höhe der Konfiguration (2 Zellen).

Mit `"title": false` beginnt der Aktienmarkt oben, ohne Platz für den Titel
(dasselbe Feld in `par` blendet den Titel der Par-Tabelle aus).

## Zellen

Eine Zelle ist `null` (es wird nichts gezeichnet), eine Zahl (der Kurs, mit der
Währung des Marktes geschrieben), eine Zeichenkette (eine Beschriftung) oder ein
Objekt mit diesen Feldern:

| Feld         | Bedeutung                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`      | Der Kurs, mit der Währung des Marktes formatiert. Hat eine Zelle einen `value`, wird ihr `label` nicht gezeichnet                                      |
| `label`      | Text statt eines Kurses                                                                                                                                |
| `subLabel`   | Ein zweiter Text in der gegenüberliegenden Ecke                                                                                                        |
| `color`      | Hintergrundfarbe                                                                                                                                       |
| `labelColor` | Farbe der Texte, standardmäßig wird eine gut lesbare gewählt                                                                                           |
| `legend`     | Der Index eines Eintrags von `stock.legend` (0 ist der erste), die Zelle übernimmt seine Farbe                                                         |
| `par`        | `true` markiert einen Par-Wert, die Zelle übernimmt die Farbe der Par-Tabelle                                                                          |
| `arrow`      | `up`, `down`, `left` oder `right` oder eine Liste davon, in einer Ecke der Zelle gezeichnet: down und left links, up und right rechts                  |
| `arrowColor` | Farbe der Pfeile                                                                                                                                       |
| `companies`  | Die Kürzel von Gesellschaften, die als Balken in der Zelle gezeichnet werden, oder `{ "abbrev": "PRR", "row": 2 }`, um die Zeile des Balkens zu wählen |
| `tokens`     | Token, die in der Zelle gezeichnet werden, jeweils mit `x` und `y` (standardmäßig die Mitte). Ein Eintrag mit `company` ist ein Gesellschaftstoken     |
| `width`      | Breite der Zelle in Zellen                                                                                                                             |
| `height`     | Höhe der Zelle in Zellen                                                                                                                               |
| `bottom`     | Zeichnet die Zelle unter den anderen, damit eine größere Nachbarin sie überdeckt                                                                       |
| `underline`  | Unterstreicht den Text                                                                                                                                 |
| `rotated`    | Dreht die Beschriftung (bei einem 1D- und 1Diag-Markt immer an)                                                                                        |
| `subRotated` | Dreht die zweite Beschriftung                                                                                                                          |

Die Hintergrundfarbe einer Zelle wird in dieser Reihenfolge gewählt: die Farbe der
Par-Tabelle bei einer Par-Zelle, der Legendeneintrag, ihre eigene `color`, die
`color` von `stock.cell` und zuletzt eine schlichte Farbe.

`stock.cell` gibt Größe und Farbe vor, mit der jede Zelle beginnt: `width` und
`height` sind Vielfache der Zellengröße der Konfiguration (eine `width` von 1,5
ist eineinhalb Zellen), und `color` ist die Standardfarbe.

Der Teil _Aktienmarkt_ des [Konfigurationsbereichs](?config=true) enthält die
Zellengröße, ob der Kurs oben oder unten in der Zelle steht, wo die Pfeile sind
(oben, mittig oder unten), die Größen für Spalte, Diag und Par und welche Teile
angezeigt werden.

## Legende

`stock.legend` ist eine Liste von Einträgen mit `description` und `color` sowie
optional `borderColor`, `borderWidth`, `fontFamily`, `fontSize` und `fontWeight`
(das `icon` wird derzeit nicht gezeichnet). Eine Zelle verwendet einen Eintrag
über seinen Index mit `legend`.

Bei einem `2D`-Markt wird die Legende nur gezeichnet, wenn `stock.display.legend`
angibt, wo: `x` und `y` sind in Zellen ab der Ecke, und jeder Eintrag liegt 35
Einheiten unter dem vorherigen. `reverse` kehrt die Reihenfolge um, `align` ist
`left` oder `right`, und `verticalAlign` mit `bottom` stapelt die Einträge nach
oben. Bei einem `1D`-Markt ist die Legende eine Zeile unter den Zellen, bei einem
`1Diag`-Markt ebenfalls, wobei `x` und `y` von `display.legend` sie verschieben
(in Einheiten, nicht in Zellen). Die Einstellung „Legende des Aktienmarkts
anzeigen“ der Konfiguration schaltet das alles aus.

## Par-Tabelle

`stock.par.values` ist die Liste der Par-Kurse in Zeilen wie die Zellen eines
Aktienmarkts. Jeder ist eine Zahl, eine Zeichenkette oder ein Zellenobjekt, und
alle sind Par-Zellen:

| Feld     | Bedeutung                                                             |
| -------- | --------------------------------------------------------------------- |
| `values` | Die Zellen der Tabelle                                                |
| `color`  | Hintergrundfarbe der Par-Zellen, standardmäßig grau                   |
| `width`  | Breite einer Zelle in Zellen, standardmäßig 4 (die der Konfiguration) |
| `height` | Höhe einer Zelle in Zellen, standardmäßig 1                           |
| `title`  | `false` blendet den Titel über der Tabelle aus                        |

Die Par-Seite druckt die Tabelle für sich. Um sie zusätzlich auf dem Aktienmarkt
zu zeichnen, setze `stock.display.par` auf `x` und `y` ihrer Ecke in Zellen. Die
Einstellung „Par-Tabelle des Aktienmarkts anzeigen“ der Konfiguration schaltet
das aus.

## Legende der Kursbewegung

`stock.movement` beschreibt, wie sich der Aktienkurs bewegt. Seine Schlüssel
`up`, `down`, `left` und `right` sind Listen von Texten, die als Pfeile um das
Wort Price gezeichnet werden. Jeder andere Schlüssel, wie `2x right` in
`18Test.json`, wird darunter als Zeile geschrieben, die mit dem Schlüssel
beginnt. Zeichne sie mit `stock.display.movement` (`x` und `y` in Zellen) auf den
Aktienmarkt. Eine Karte kann sie ebenfalls mit `map.movement` zeichnen: Setze
nicht beides, ein auf einer Karte platzierter Aktienmarkt zeichnet seine eigene.

## Rundenanzeige

`stock.display.roundTracker` zeichnet die Runden des Spiels (`rounds`) als Token
auf den Aktienmarkt, damit die Spieler die aktuelle Runde markieren können. `x`
und `y` sind in Zellen, und `type` ist `row` (Standard), `row-reverse`, `col`,
`col-reverse` oder `round`, das sie auf einen Kreis setzt, den `rotation` (in
Grad) dreht. Die Einstellung „Rundenanzeige des Aktienmarkts anzeigen“ der
Konfiguration schaltet sie aus. Dasselbe Feld der Karte, `map.roundTracker`,
zeichnet sie auf die Karte.

## Ledges

`stock.ledges` zeichnet Linien von Zellenecke zu Zellenecke über den Aktienmarkt,
zum Beispiel um eine Gruppe von Zellen abzugrenzen:

```json
{
  "ledges": [
    {
      "coords": ["4 0", "4 1", "15 1", "15 0", "4 0"],
      "color": "orange",
      "dashed": true
    }
  ]
}
```

Jeder Eintrag von `coords` ist `"x y"`, eine Ecke des Rasters in Zellen (`0 0` ist
die obere linke Ecke der ersten Zelle). Die weiteren Felder sind `color`, `width`
(standardmäßig 3), `border` mit `borderWidth`, um die Linie in der Spurfarbe
einzufassen, und `dashed` mit `dashArray` und `offset`.

## Anzeigeoptionen

`stock.display` enthält die Positionen der oben genannten Teile (`par`, `legend`,
`roundTracker` und `movement`) sowie `extraTotalWidth` und `extraTotalHeight`,
zusätzlichen Platz in Einheiten rechts und unten auf der Seite. Ein Aktienmarkt
kann mit `map.market` und `x` und `y` auch auf einer Karte gezeichnet werden, und
zwar nur, wenn die Marktoption unter _Karten_ in der Konfiguration an ist.

## Einnahmentabelle

Die Einnahmen-Seite druckt eine Tabelle der Zahlen von 1 bis 100 in Zeilen zu je
20, wobei jede fünfte Zahl gelb und jede zehnte orange ist. Das Feld `revenue`
auf oberster Ebene ändert sie: `min` und `max` sind die erste und die letzte
Zahl, und `perRow` ist die Anzahl pro Zeile. Es gehört nicht zu `stock`, und
jedes Spiel hat diese Seite.

## Limits

`stock.limits` ist eine Liste von Kursbereichen (`description`, `color`, `min`
und `max`), zum Beispiel die erlaubten Par-Werte. Sie wird nur als Referenz mit
dem Spiel aufbewahrt und nicht gedruckt.
