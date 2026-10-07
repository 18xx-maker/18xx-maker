# Plättchen und Felder

Eine Spieldatei zeichnet Felder an zwei Stellen: `tiles` sind die Plättchen,
die die Spieler legen, und `map` ist das Spielbrett, auf das sie gelegt werden.
Beide verwenden dieselbe Felddefinition. Alles auf dieser Seite über den Inhalt
eines Feldes (`color`, `track`, `cities`, ...) gilt also für beide. Die Felder
stehen im [Spiel-Schema](https://18xx-maker.com/schemas/game.schema.json) und im
[Plättchen-Schema](https://18xx-maker.com/schemas/tiles.schema.json).

## Plättchen

`tiles` ist ein Objekt. Jeder Schlüssel ist eine Plättchen-ID, und der Wert sagt,
wie viele es gibt und, wenn 18xx Maker das Plättchen noch nicht kennt, wie es
aussieht. IDs können Zahlen oder Buchstaben sein (`57`, `T1`, `DB801`). Es gibt
vier Formen:

```json
{
  "tiles": {
    "1": 1,
    "2": { "tile": "57", "quantity": 2 },
    "26|T2": 1,
    "63": { "quantity": 2, "print": 3, "rotations": 3 },
    "T1": {
      "quantity": 1,
      "color": "offboard",
      "track": [{ "type": "offboard", "side": 1 }]
    }
  }
}
```

- **Eine Zahl** ist die Menge eines allgemeinen Plättchens. Das Plättchen stammt
  aus den allgemeinen Plättchen, die unter [Elemente >
  Plättchen](/elements/tiles) aufgelistet sind.
- **`tile`** macht die ID zu einem Alias eines anderen Plättchens. Hier wird `2`
  wie `57` gezeichnet, und es gibt zwei davon.
- **`id|extra`** ist eine zweite Ausfertigung des allgemeinen Plättchens `id`
  mit einer Beschriftung. Der Teil nach dem `|` wird klein neben der
  Plättchennummer gedruckt, `26|T2` ist also Plättchen 26 mit der Markierung T2.
  Das Plättchen wird weiterhin über den Teil vor dem `|` gefunden.
- **Ein Objekt mit einer `color`** ist die vollständige Definition eines eigenen
  Plättchens. Es nimmt dieselben Felder wie ein Kartenfeld, ein Plättchen kann
  also Gleise, Städte, Orte, Werte, Beschriftungen und alles aus der
  [Elementtabelle](#elemente) unten haben.
- **Ein Objekt ohne `color`** geht vom allgemeinen Plättchen mit dieser ID aus
  und ändert oder ergänzt Felder, zum Beispiel `quantity`, `print` oder
  `rotations`.

Die Felder, bei denen es ums Drucken eines Plättchens statt ums Zeichnen geht:

| Feld             | Was es bewirkt                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quantity`       | Wie viele des Plättchens es gibt und wie viele auf den Plättchenbögen gedruckt und in der Plättchenübersicht aufgelistet werden.                                 |
| `print`          | Wenn gesetzt und nicht 0, wird es statt `quantity` für die Bögen, die Übersicht und die Statistik verwendet, zum Beispiel um Ersatz zu drucken.                  |
| `group`          | Die Bögen gruppieren Plättchen nach Farbe und Spurweite. `group` legt einen eigenen Namen fest, und `individual` hält das Plättchen von den anderen getrennt.    |
| `clipPath`       | `false` druckt das Plättchen ohne Beschnittkontur, für Plättchen mit aufwendigen Rändern oder anderen Beschnittproblemen.                                        |
| `stripeRotation` | Der Winkel der Streifen einer gestreiften Farbe wie `yellow/blue`.                                                                                               |
| `rotations`      | Nur für [Board18](/docs/output/b18): eine Zahl, um die ersten n Drehungen des Plättchens zu verwenden, oder eine Liste von Drehungen in Grad (Vielfache von 60). |

Die Plättchen werden auf den Plättchenbögen gedruckt (Layout, Breite und
Abstände stehen in den `tiles`-Optionen auf der Konfigurationsseite) und mit
ihren Mengen in der Plättchenübersicht aufgelistet.

## Felder der Karte

`map` enthält die Felder des Spielbretts. Das Feld `hexes` darin ist eine Liste
von Felddefinitionen. Jede Definition hat eine `color` und in `hexes` eine Liste
von Koordinaten, für die sie gilt, sodass eine Definition viele Felder malen
kann:

```json
{
  "map": {
    "hexes": [
      {
        "color": "yellow",
        "track": [{ "type": "straight", "side": 1 }],
        "hexes": ["A13"]
      },
      { "color": "plain", "hexes": ["C11", "C13", "C15"] }
    ]
  }
}
```

Neben `hexes` nimmt die Karte die Einstellungen der Dinge entgegen, die darüber
gezeichnet werden: `borders`, `borderTexts` und `lines` (siehe [Kartenränder
und Linien](/docs/games/borders)), `roundTracker`, `movement`, `market` und
`players`. Das sind die Teile der Karte, die keine Felder sind, die Details
stehen im Schema.

### Halbe Felder und beschnittene Karten

Ein Kartenfeld mit `half` auf `top`, `bottom`, `left` oder `right` zeichnet nur
diese Hälfte, durch die Mitte geschnitten, mit einem Rand um den gezeichneten
Teil (der Schnitt selbst bekommt keinen). Die Richtungen sind die der Seite. Bei
einer Karte mit spitzen Feldern schneiden `top` und `bottom` durch die Mitte
zweier Seiten, `left` und `right` von Ecke zu Ecke; bei einer Karte mit
`"orientation": "horizontal"` ist es umgekehrt. Nur das Feld wird geschnitten:
Was über den Rand hinaus gezeichnet wird, etwa seine ID, ein Name oder ein
Routenbonus, nicht. Plättchen ignorieren `half`.

`trim` an der Karte schneidet eine halbe Reihe oder Spalte von den Rändern der
Karte ab, für eine Karte, die auf einem anderen Brett weitergeht. Es nimmt
`top`, `bottom`, `left` und `right`, jeweils `true` oder `false`. Die Seite wird
um das halbe Feld kleiner, und die Felder an diesem Rand werden als Hälften
gezeichnet, als hätte jedes ein eigenes `half`. Die Ränder sind die der Seite,
auch bei einer horizontalen Karte. Hat ein Feld zusätzlich sein eigenes `half`,
bleibt nur, was beide übrig lassen (zwei Hälften ohne gemeinsamen Teil lassen
nichts übrig). Ein `removeBorders` an einem Feld wirkt wie zuvor auf den
gezeichneten Teil.

```json
{
  "map": {
    "trim": { "bottom": true },
    "hexes": [{ "color": "plain", "half": "left", "hexes": ["A1"] }]
  }
}
```

## Eine oder mehrere Karten

`map` kann ein Objekt sein oder eine Liste von Objekten für ein Spiel mit
mehreren Karten oder Kartenvarianten. Die Liste ist ab 0 nummeriert, und die
Kartenauswahl in der Werkzeugleiste legt fest, welche angezeigt wird. Jeder
Eintrag kann Folgendes haben:

- **`name`** ist der Name in der Auswahl. Bei einer anderen Karte als der ersten
  wird er auch unter dem Titel des Spiels auf der Karte gedruckt.
- **`title: false`** lässt den Titel des Spiels auf dieser Karte weg.
- **`copy`** ist die Nummer einer anderen Karte in der Liste. Diese Karte
  beginnt mit den `hexes`, `borderTexts`, `borders` und `lines` jener Karte und
  fügt ihre eigenen hinzu.
- **`remove`** ist eine Liste von Koordinaten. Sie nimmt diese Felder aus der
  kopierten Karte heraus. Es wird nur zusammen mit `copy` verwendet.
- **`trim`** ist unter [Halbe Felder und beschnittene Karten](#halbe-felder-und-beschnittene-karten)
  beschrieben. Eine Karte mit `copy` behält das `trim` der kopierten Karte und
  kann einen Rand neu setzen (`false` bringt die Hälfte zurück).

Eine Variante, die die erste Karte mit ein paar Änderungen ist:

```json
{
  "map": [
    {
      "name": "Standard",
      "hexes": [{ "color": "plain", "hexes": ["A1", "A3"] }]
    },
    {
      "name": "Variant",
      "copy": 0,
      "remove": ["A3"],
      "hexes": [{ "color": "water", "hexes": ["A5"] }]
    }
  ]
}
```

Alles, was die Karte exportiert (`--variation` auf der Kommandozeile, die
Board18-Box), arbeitet mit jeweils einer Karte, siehe
[Exportoptionen](/docs/games/exports).

## Elemente

Diese Felder eines Kartenfelds zeichnen etwas darauf. Jedes nimmt eine Liste.
Sie lassen sich auf dieselbe Weise [positionieren](/docs/games/positioning) (mit
`angle`, `percent`, `mid`, `side` und so weiter), und standardmäßig platziert
18xx Maker sie für dich. Ränder an den Kanten von Feldern und die Ränder der
Karte stehen unter [Kartenränder und Linien](/docs/games/borders). Die Seite
[Atome](/elements/atoms) zeichnet zu jedem ein Beispiel.

| Element                                 | Was es zeichnet                                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `track`                                 | Gleis zwischen Seiten des Feldes: `sharp`, `gentle`, `straight` und andere, in der gewählten Spurweite            |
| `cities`                                | Städte mit ihrer Größe und den Gesellschaften, deren Heimat sie sind                                              |
| `towns`                                 | Orte (die kleinen Punkte)                                                                                         |
| `centerTowns`                           | Ein Ort in der Mitte eines Gleisstücks                                                                            |
| `mediumCities`                          | Eine Stadt, die in der Größe zwischen Ort und Stadt liegt                                                         |
| `boomtowns`                             | Eine Boomtown                                                                                                     |
| `offBoardRevenue`                       | Die Einnahmefelder eines Randfeldes mit einem Wert je Phase                                                       |
| `values`                                | Eine Zahl, etwa die Einnahmen einer Stadt                                                                         |
| `names`                                 | Der Name eines Ortes                                                                                              |
| `labels`                                | Ein Buchstabe oder ein kurzer Text wie `NY`                                                                       |
| `icons`                                 | Ein Symbol aus `src/data/icons`                                                                                   |
| `shapes`                                | Einfache Formen, optional mit Text                                                                                |
| `terrain`                               | Gelände wie Berge oder Wasser mit seinen Kosten                                                                   |
| `bridges`, `tunnels`, `tunnelEntrances` | Die Kosten einer Brücke oder eines Tunnels und wo ein Tunnel beginnt                                              |
| `borders`                               | Ein farbiger Rand an einer Seite des Feldes                                                                       |
| `removeBorders`                         | Entfernt den Rand, der an den angegebenen Seiten des Feldes gezeichnet wird                                       |
| `half`                                  | Zeichnet nur die obere (`top`), untere (`bottom`), linke (`left`) oder rechte (`right`) Hälfte eines Kartenfeldes |
| `divides`                               | Eine Linie, die das Feld teilt                                                                                    |
| `companies`                             | Eine Gesellschaftsbeschriftung auf dem Feld, etwa die Heimat einer Gesellschaft                                   |
| `tokens`                                | Ein auf dem Feld platzierter Token                                                                                |
| `goods`                                 | Eine Warenmarkierung                                                                                              |
| `industries`                            | Eine Industriemarkierung mit einem oberen und einem unteren Wert                                                  |
| `routeBonuses`                          | Ein Streckenbonus-Wert                                                                                            |

Ein Feld, das die Tabelle nicht gut beschreibt, ist im Schema beschrieben, und
jedes Feld hat dort eine Beschreibung.

## Beispiele

`src/data/games/18Test.json` ist das Testspiel und enthält ein Beispiel für jede
Form von `tiles` und für die obigen Elemente. Die allgemeinen Plättchen liegen in
`src/data/tiles` und sind gute Vorlagen für ein eigenes Plättchen.
[Deine erste Spieldatei](/docs/games/first-game) zeigt ein kleines Spiel mit Karte
und Plättchen.
