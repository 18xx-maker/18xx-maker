# Positionierung

Jedes Element auf einem Plättchen (Städte, Orte, Werte, Beschriftungen, Symbole,
Gelände, ...) lässt sich mit denselben Feldern positionieren. Hat ein Element
keines davon, setzt die automatische Positionierung einige häufige Elemente an
eine Standardstelle.

## Optionen

Alle sind optional und funktionieren bei jedem Element mit Position
([Beispiele](/elements/positioning#basic)):

- `angle` (-360 bis 360, ausschließlich) ist die Richtung von der Mitte des
  Kartenfelds, in der das Element sitzt, in Grad. 0 ist gerade nach unten, und
  es dreht im Uhrzeigersinn.
- `percent` (0 oder mehr) ist, wie weit es in dieser `angle`-Richtung nach außen
  geht: 0 ist die Mitte und 1 die Mitte der Kartenfeldkante.
- `x` und `y` verschieben das Element in einfachen Einheiten von der Stelle, an
  die `angle` und `percent` es setzen.
- `rotation` (-360 bis 360, ausschließlich) dreht das Element an seiner Stelle,
  in Grad. `rotate` ist dasselbe Feld mit kürzerem Namen.
- `side` (1 bis 6) dreht das Element um (side - 1) Sechstel einer Drehung: Seite 1
  ist nicht gedreht, Seite 2 um 60 Grad. Mit `mid` verschiebt es stattdessen den benannten
  Punkt, siehe [Benannte Positionen](#benannte-positionen).
- `mid` und `align` setzen und drehen das Element nach dem Gleis, siehe [Benannte
  Positionen](#benannte-positionen).
- `hidden` (`true`) zeichnet das Element nicht. Die anderen Elemente behalten
  ihre Positionen.

```json
{
  "labels": [{ "label": "B", "angle": 90, "percent": 0.6, "x": 5 }],
  "towns": [{ "side": 2 }]
}
```

## Automatische Positionierung

Das System zur automatischen Positionierung wendet nach sehr einfachen Regeln
automatisch Positionen auf die Elemente an, die es findet. Dieses System soll
NICHT alles abdecken, sondern nur bei den üblichen 95 % der Positionierungsfälle
helfen.

18xx-maker hat zum Beispiel einen bestimmten Standard, den es auf einfache
Plättchen anwendet. Wenn du ein Kartenfeld mit einer einzelnen Stadt und
Geländekosten hast, setzt die automatische Positionierung die Geländekosten an
die „Standard“-Position, solange auf dem Kartenfeld keine anderen
Positionsdaten stehen. Wenn du deine Elemente selbst positionieren möchtest,
tu das ruhig. Das System soll nur sinnvolle Standardwerte liefern, wenn du es
nicht tust.

Wenn du die automatische Positionierung für ein Element ausschalten möchtest,
füge diesem Element einfach ein Positionsfeld (`angle`, `percent`, `rotate`,
`rotation`, `side`, `mid`, `align`, `x` oder `y`) hinzu. Wenn du zum Beispiel `"angle": 0`
hinzufügst, wird die automatische Positionierung faktisch ausgeschaltet, und das
Element bleibt in der Mitte des Kartenfelds. Das gilt nur für dieses Element, die
anderen Elemente des Kartenfelds werden weiterhin positioniert.

Jede Option und jede Regel wird auf der Beispielseite
[Positionierung](/elements/positioning) live mit ihrem JSON gezeichnet.

## Regeln

### Symbole

Symbole (auf einem Plättchen mit einer Stadt oder centerTown) werden verschoben
nach ([Beispiele](/elements/positioning#icons)):

```json
{
  "angle": 0,
  "percent": 0.6
}
```

Wenn es zusätzlich Geländekosten gibt, wird das Symbol nach links verschoben, nach:

```json
{
  "angle": 30,
  "percent": 0.6
}
```

### Werte

Der erste Wert jedes Plättchens wird automatisch in die obere rechte Ecke
positioniert ([Beispiele](/elements/positioning#values)). Weitere Werte werden
nicht verschoben:

```json
{
  "angle": 210,
  "percent": 0.7
}
```

### Beschriftungen

Die erste Beschriftung auf einem Plättchen wird automatisch in die obere linke
Ecke positioniert ([Beispiele](/elements/positioning#labels)):

```json
{
  "angle": 150,
  "percent": 0.7
}
```

Die zweite Beschriftung auf einem Plättchen wird automatisch an die rechte
Seite positioniert. Weitere Beschriftungen werden nicht verschoben:

```json
{
  "angle": 270,
  "percent": 0.7
}
```

### Gelände

Geländekosten (auf einem Plättchen mit einer Stadt oder centerTown) werden
verschoben nach ([Beispiele](/elements/positioning#terrain)):

```json
{
  "angle": 0,
  "percent": 0.7
}
```

Wenn es zusätzlich ein Symbol gibt, werden die Geländekosten nach rechts
verschoben, nach:

```json
{
  "angle": 330,
  "percent": 0.7
}
```

## Benannte Positionen

Statt `angle` und `percent` auszurechnen, kann ein Element mit `mid` einen Punkt
auf einem Gleis benennen und sich mit `align` am Gleis dort ausrichten. Das
funktioniert bei jedem Element mit Position (Orte, centerTowns, Werte,
Beschriftungen, Symbole, ...). Wie jedes andere Positionsfeld schalten sie die
automatische Positionierung für dieses Element aus. Jeder Punkt gilt für ein
Gleis, das auf Seite 1 beginnt. Mit `side` wird er auf eine andere Seite
gedreht.

- `mid` ist die Mitte eines Gleistyps: `straight` (`angle` 0, `percent` 0, die
  Mitte), `sharp` (`angle` 30, `percent` 0.577) oder `gentle` (`angle` 60,
  `percent` 0.268).
- `side` mit `mid` dreht den Punkt wie ein Gleis, das auf dieser Seite beginnt,
  ein `gentle` auf Seite 3 liegt also bei `angle` 180. Ohne `mid` dreht `side`
  weiterhin das Element.
- `align` ist `perpendicular` (senkrecht) oder `parallel` (parallel) zum Gleis
  an diesem Punkt. Ein Ortsbalken auf einem `sharp` ist `perpendicular` mit einer
  `rotation` von 120, auf einem `gentle` 150. `rotate` und `rotation` werden als
  Versatz addiert.
- Ein ausdrückliches `angle` oder `percent` ersetzt den Wert aus `mid`, und `x`
  und `y` verschieben davon ausgehend.

```json
{
  "track": [{ "type": "gentle", "side": 1 }],
  "towns": [{ "mid": "gentle", "align": "perpendicular" }]
}
```

([Beispiele](/elements/positioning#named))

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

- Eine negative Zahl zeichnet das Element vor allen anderen, `true` zeichnet es
  zuletzt und `0` zeichnet es nach den Elementen ohne `order`.
- Elemente mit gleicher `order` behalten die übliche Reihenfolge nach Typ.
- Ein Element bleibt auf seiner Seite von Feldrand und ID: innere Elemente
  eines Feldes können nicht über den Rand, und außen gezeichnete Elemente (wie
  Städte außerhalb oder Namen) nicht darunter.
- Sie kann Gleise verdecken.
- Gleise, Off-Board-Gleise, Trennlinien und Ränder haben keine `order`.
