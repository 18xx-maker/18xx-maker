# Automatische Positionierung

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

Jede der folgenden Regeln wird auf der Beispielseite [Automatische
Positionierung](/elements/positioning) live mit ihrem JSON gezeichnet.

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
