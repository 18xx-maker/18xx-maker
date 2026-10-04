# Aktien- und Tokentypen

Du kannst jetzt allen Gesellschaften in einer Spieldatei Aktien und Token
hinzufügen, ohne dieselbe Definition in jede Gesellschaft zu kopieren.

## Verwendung

Statt Token und Aktien für eine Gesellschaft zu definieren, kannst du die
Definition durch eine einzelne Zeichenkette ersetzen. Diese Zeichenkette muss
auf eines der Felder des Objekts `shareTypes` oder `tokenTypes` verweisen, das
in der Datei definiert ist.

Die Definitionen in `shareTypes` und `tokenTypes` funktionieren genau wie
bisher als Teil jeder Gesellschaft.

Für die Namen `default` und `minor` gibt es ein besonderes Verhalten. Wenn du
einen Token- oder Aktientyp namens `minor` definierst und Gesellschaften mit
`"minor": true` hast, verwendet xxMaker diese Definitionen für jede Minor, die
keine eigene Aktien- oder Token-Definition hat. Wenn du einen Token- oder
Aktientyp namens `default` definierst, verwendet xxMaker diese Definitionen für
jede Gesellschaft, die nicht in den `minor`-Definitionen enthalten war und keine
eigenen Definitionen für Aktien oder Token hatte.

## Beispiele

Ein Spiel mit einem Typ `minor` und einem Typ `default` sowie drei
Gesellschaften. Die erste ist eine Minor, die zweite hat keine eigenen
Definitionen, und die dritte wählt die `default`-Typen per Namen aus:

```json
{
  "tokenTypes": {
    "minor": ["Home"],
    "default": ["Home", 40, 100]
  },
  "shareTypes": {
    "minor": [{ "quantity": 2, "percent": 50, "shares": 1 }],
    "default": [
      {
        "quantity": 1,
        "label": "President's Certificate",
        "percent": 20,
        "shares": 2
      },
      { "quantity": 8, "percent": 10, "shares": 1 }
    ]
  },
  "companies": [
    {
      "name": "Black Railroad",
      "abbrev": "BLRR",
      "color": "black",
      "minor": true
    },
    { "name": "Blue Railroad", "abbrev": "BLU", "color": "blue" },
    {
      "name": "Red Railroad",
      "abbrev": "RED",
      "color": "red",
      "tokens": "default",
      "shares": "default"
    }
  ]
}
```

Typen können beliebige Namen haben, und Gesellschaften verweisen mit einer
Zeichenkette auf sie, zum Beispiel
`"tokenTypes": { "default": ["Free", 40], "one": ["Free"] }` mit
`{ "abbrev": "KU", "tokens": "one" }`. Die Dateien für 1889 und 1867 in
`src/data/games` verwenden diese.

## Kreditfelder

Eine Gesellschaft kann auch `loans` haben, zusätzliche Felder auf ihrer
Gesellschaftskarte, zum Beispiel für die Kredite eines Spiels. Jeder Eintrag ist
die Beschriftung unter dem Feld, und jedes Feld wird als leeres Quadrat im
Hauptteil der Gesellschaftskarte gedruckt, rechts unter der Kopfzeile, in
Spalten, die in die Höhe der Gesellschaftskarte passen, damit es nie mit einem Token verwechselt wird. Eine leere
Zeichenkette oder `null` lässt das Feld ohne Beschriftung:

```json
{ "abbrev": "RED", "tokens": [0, 40], "loans": [50, 50, ""] }
```

Kredite, die nicht passen, werden abgeschnitten; halte die Anzahl bei Minors und Gesellschaftskarten halber Breite daher klein.
