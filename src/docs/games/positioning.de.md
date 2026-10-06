# Positionierung

Jedes Element auf einem Plättchen (Städte, Orte, Werte, Beschriftungen, Symbole,
Gelände, ...) wird mit demselben kleinen Satz von Feldern platziert. Diese Seite
erklärt sie in der Reihenfolge, in der du sie brauchst. Jeder Schritt ist live,
mit seinem JSON, auf der Beispielseite
[Positionierung](/elements/positioning) gezeichnet.

1. [Koordinaten](#koordinaten): wo 0 liegt und in welche Richtung es geht.
2. [Platzieren](#platzieren): `angle`, `percent`, `x` und `y`.
3. [Drehen](#drehen): `rotation`, `rotate` und `side`.
4. [Benannte Positionen](#benannte-positionen): `mid` und `align`.
5. [Ausblenden](#ausblenden): `hidden`.
6. [Automatische Positionierung](#automatische-positionierung): wohin etwas
   kommt, wenn du nichts angibst.
7. [Zeichenreihenfolge](#zeichenreihenfolge): `order`.

Ein Platzierungsfeld an einem Element schaltet die automatische Positionierung
für dieses Element aus, siehe [Ausschalten](#ausschalten).

## Welche Elemente sich positionieren lassen

Diese Plättchenelemente nehmen die Felder dieser Seite: `track`, `cities`,
`towns`, `centerTowns`, `boomtowns`, `mediumCities`, `labels`, `icons`, `names`,
`shapes`, `terrain`, `bridges`, `tunnels`, `tunnelEntrances`, `divides`,
`values`, `goods`, `companies`, `tokens`, `routeBonuses`, `industries` und
`offBoardRevenue`. `track` und `divides` haben keine `order`. `borders` nehmen
nur `side`.

## Koordinaten

Der Ursprung ist die Mitte des Kartenfelds. Jede Position wird von dort
gemessen, in Einheiten, bei denen die Mitte einer Kante 75 von der Mitte
entfernt ist (ein Kartenfeld ist von Kante zu Kante 150 Einheiten breit). Das
erste [Beispiel](/elements/positioning#place) zeigt angle 0, 90, 180 und 270.

- `angle` ist eine Richtung in Grad, **im Uhrzeigersinn auf dem Bildschirm**: 0
  ist gerade nach unten, 90 nach links, 180 nach oben und 270 nach rechts.
- `percent` ist, wie weit es in dieser Richtung geht, als Bruchteil von 75
  Einheiten: 0 ist die Mitte und 1 ist 75 Einheiten weit draußen.
- `x` und `y` sind einfache Bildschirmeinheiten: `x` geht nach rechts und `y`
  nach unten.

Winkel sind Richtungen auf dem Bildschirm, nicht Richtungen des Kartenfelds. Auf
einem Plättchen und auf einer Karte mit `horizontal` liegt die Mitte einer Kante
bei angle 0, 60, 120 und so weiter, `percent` 1 liegt also genau auf einer
Kante. Auf der Standardkarte `vertical` ist das Kartenfeld um 90 Grad gedreht:
angle 0 zeigt auf eine Ecke (etwa 86.6 Einheiten entfernt), und die Kantenmitten
liegen bei angle 30, 90, 150 und so weiter. Nur `mid` (siehe
[Benannte Positionen](#benannte-positionen)) folgt dieser Drehung von selbst.

## Platzieren

- `angle` (-360 bis 360, ausschließlich, Standard 0) und `percent` (0 oder mehr,
  Standard 0) setzen das Element: erst um `angle` drehen, dann um `percent`
  nach außen gehen.
- `x` und `y` (Standard 0) verschieben es dann in einfachen Bildschirmeinheiten.
  Sie werden weder von `angle` noch von einer Drehung gedreht, `"x": 10` ist
  also immer 10 Einheiten nach rechts.

```json
{
  "labels": [{ "label": "B", "angle": 90, "percent": 0.6, "x": 5 }]
}
```

([Beispiele](/elements/positioning#place))

Ein `percent` über 1 geht über die Kante des Kartenfelds hinaus. Die meisten
Elemente werden an der Kante des Kartenfelds abgeschnitten, du siehst also nur
den Teil innen. Elemente, die außerhalb gezeichnet werden, werden nicht
abgeschnitten: `names`, `cities` außerhalb, `shapes` ohne `background`,
`bridges`, `tunnels`, `offBoardRevenue`, `industries`, `companies` und
`routeBonuses`.

## Drehen

- `rotation` und `rotate` (-360 bis 360, ausschließlich) drehen das Element an
  seiner Stelle, im Uhrzeigersinn, in Grad. Es ist dasselbe Feld mit zwei
  Namen. Nimm nur eines davon: ein `rotate` ungleich 0 gewinnt gegen `rotation`,
  und `"rotate": 0` fällt auf `rotation` zurück. Sie werden nie addiert.
- `side` (1 bis 6) ohne `mid` dreht das Element um (side - 1) Sechstel einer
  Drehung: Seite 1 ist nicht gedreht, Seite 2 um 60 Grad. Es dreht das Element
  nur und verschiebt es nicht. Es wird zu `rotation` oder `rotate` addiert. Mit
  `mid` verschiebt es stattdessen den benannten Punkt, siehe
  [Benannte Positionen](#benannte-positionen).

```json
{
  "towns": [{ "rotation": 45 }]
}
```

([Beispiele](/elements/positioning#turn))

Nicht alles dreht sich gleich, denn Text soll lesbar bleiben:

| Element                                | `rotation`                                  | `rotate` und `side` |
| -------------------------------------- | ------------------------------------------- | ------------------- |
| Orte, Städte (und ihre Namen), Symbole | dreht                                       | dreht               |
| Beschriftungen, Werte, Gelände         | bleibt aufrecht, du siehst keine Drehung    | dreht               |
| Token                                  | dreht doppelt so weit (die Aufschrift auch) | dreht               |

Nimm `rotate` oder `side`, wenn sich der Text einer Beschriftung, eines Werts
oder von Gelände drehen soll, und `rotate`, um einen Token zu drehen.
`"fixed": true` an einem Token dreht ihn genau so weit wie das Element, egal
welches der drei Felder du benutzt.

Mit `mid` bleibt der Text von Beschriftungen, Werten und Gelände aufrecht,
welches Feld du auch benutzt.

## Benannte Positionen

Statt `angle` und `percent` auszurechnen, kann ein Element mit `mid` einen Punkt
auf einem Gleis benennen und sich mit `align` zum Gleis an dieser Stelle
drehen. Sie funktionieren bei jedem Element mit Position (Orte, centerTowns,
Werte, Beschriftungen, Symbole, ...). Der Punkt gilt für ein Gleis, das auf
Seite 1 beginnt, mit `side` verschiebst du ihn auf eine andere Seite.

- `mid` ist die Mitte eines Gleistyps. Nur diese Gleistypen in voller Länge
  haben einen Namen:

  | `mid`      | `angle` | `percent` |
  | ---------- | ------- | --------- |
  | `straight` | 0       | 0         |
  | `sharp`    | 30      | 0.577     |
  | `gentle`   | 60      | 0.268     |

- `side` mit `mid` verschiebt den Punkt wie ein Gleis, das auf dieser Seite
  beginnt, ein `gentle` auf Seite 3 liegt also bei `angle` 180. Das ist die
  einzige Stelle, an der `side` etwas verschiebt, ohne `mid` dreht es das
  Element nur.
- `align` ist `perpendicular` (senkrecht) oder `parallel` (parallel) zum Gleis
  an diesem Punkt. Es braucht ein `mid`. Ein Ortsbalken auf einem `sharp` ist
  `perpendicular` mit einer `rotation` von 120, auf einem `gentle` 150. `rotate`
  und `rotation` werden als Versatz addiert.
- Ein ausdrückliches `angle` oder `percent` ersetzt den Wert aus `mid`, und `x`
  und `y` verschieben davon ausgehend.
- Auf einer Karte mit `vertical` wird das Gleis um 90 Grad gedreht gezeichnet, und
  `mid` dreht sich mit, es liegt also auf dem Gleis. Ein geschriebenes `angle`
  oder `percent` dreht sich nicht.

```json
{
  "track": [{ "type": "gentle", "side": 1 }],
  "towns": [{ "mid": "gentle", "align": "perpendicular" }]
}
```

([Beispiele](/elements/positioning#named))

## Ausblenden

`hidden` (`true`) zeichnet das Element nicht. Die anderen Elemente behalten ihre
Positionen: ein ausgeblendetes Element zählt weiter für die
[Automatische Positionierung](#automatische-positionierung), die zweite
Beschriftung bleibt also die zweite Beschriftung.

```json
{
  "labels": [{ "label": "B", "hidden": true }, { "label": "NY" }]
}
```

([Beispiele](/elements/positioning#hide))

## Automatische Positionierung

Die automatische Positionierung setzt die üblichen 95% der Elemente an eine
Standardstelle, damit du es nicht tun musst. Sie soll nicht vollständig sein. Sie
betrachtet jedes Element für sich: ein Element wird automatisch positioniert,
wenn es keines von `angle`, `percent`, `rotate`, `rotation`, `side`, `mid`,
`align`, `x` oder `y` hat. `hidden` und `order` zählen nicht.

| Element      | Welche     | Wohin (`angle`, `percent`)                      | Nur wenn                                |
| ------------ | ---------- | ----------------------------------------------- | --------------------------------------- |
| Werte        | der erste  | 210, 0.7 (oben rechts)                          | immer                                   |
| Beschriftung | die erste  | 150, 0.7 (oben links)                           | immer                                   |
| Beschriftung | die zweite | 270, 0.7 (rechts)                               | immer                                   |
| Symbole      | alle       | 0, 0.6, oder 30, 0.6 wenn das Feld Gelände hat  | das Feld hat eine Stadt oder centerTown |
| Gelände      | alle       | 0, 0.7, oder 330, 0.7 wenn das Feld Symbole hat | das Feld hat eine Stadt oder centerTown |

"Der erste" meint den ersten Eintrag dieses Arrays, jeder Eintrag zählt mit: eine
ausgeblendete oder von Hand positionierte erste Beschriftung belegt trotzdem die
erste Stelle, die nächste Beschriftung ist also die zweite und kommt nach 270.
Weitere Werte und Beschriftungen werden nicht verschoben. Mehrere Symbole (oder
mehrere Geländefelder) wandern alle an dieselbe Stelle und überlappen sich, gib
also allen außer einem eine Position.

([Beispiele](/elements/positioning#auto))

### Ausschalten

Um ein Element aus der automatischen Positionierung herauszuhalten, gib ihm ein
Platzierungsfeld. Zum Beispiel schaltet `"angle": 0` sie wirksam aus und lässt
das Element in der Mitte des Kartenfelds. Das gilt nur für dieses Element, die
anderen Elemente des Kartenfelds werden weiterhin positioniert.

```json
{
  "cities": [{}],
  "terrain": [{ "type": "mountain", "cost": 60, "angle": 0 }]
}
```

([Beispiele](/elements/positioning#off))

## Zeichenreihenfolge

Die Position legt nur fest, wo ein Element sitzt. Welches Element über welchem
gezeichnet wird, folgt einer festen Reihenfolge nach Typ (Städte, dann Werte,
Beschriftungen, Token, Gelände, Symbole und so weiter). Um das zu ändern, gib
einem Element eine `order`. Es wird nach allen Elementen seines Feldes ohne
`order` gezeichnet, das mit der kleinsten `order` zuerst, und seine Position
ändert sich nicht. Zum Beispiel, um eine Stadt über einen Wert zu zeichnen:

```json
{
  "cities": [{ "order": 1 }],
  "values": [{ "value": 30, "x": 0, "y": 0 }]
}
```

([Beispiele](/elements/positioning#order))

- Eine negative Zahl zeichnet das Element vor allen anderen, `true` zeichnet es
  zuletzt und `0` zeichnet es nach den Elementen ohne `order`.
- Elemente mit gleicher `order` behalten die übliche Reihenfolge nach Typ.
- Ein Element bleibt auf seiner Seite von Feldrand und ID: innere Elemente
  eines Feldes können nicht über den Rand, und außen gezeichnete Elemente (wie
  Städte außerhalb oder Namen) nicht darunter.
- Sie kann Gleise verdecken.
- Gleise, Trennlinien und Ränder haben keine `order`.
