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
füge diesem Element einfach ein einzelnes Positionsfeld hinzu. Wenn du zum
Beispiel `"angle": 0` hinzufügst, wird die automatische Positionierung
faktisch ausgeschaltet, und das Element bleibt in der Mitte des Kartenfelds.

## Regeln

### Symbole

Symbole (auf einem Plättchen mit einer einzelnen Stadt oder centerTown) werden
verschoben nach:

```json
{
  "angle": 0,
  "percent": 0.6
}
```

Wenn es zusätzlich Geländekosten gibt, werden diese nach links verschoben, nach:

```json
{
  "angle": 30,
  "percent": 0.6
}
```

### Werte

Der erste Wert jedes Plättchens wird automatisch in die obere rechte Ecke
positioniert:

```json
{
  "angle": 210,
  "percent": 0.7
}
```

### Beschriftungen

Die erste Beschriftung auf einem Plättchen wird automatisch in die obere linke
Ecke positioniert:

```json
{
  "angle": 150,
  "percent": 0.7
}
```

Die zweite Beschriftung auf einem Plättchen wird automatisch an die rechte
Seite positioniert:

```json
{
  "angle": 270,
  "percent": 0.7
}
```

### Gelände

Geländekosten (auf einem Plättchen mit einer einzelnen Stadt oder centerTown)
werden verschoben nach:

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
