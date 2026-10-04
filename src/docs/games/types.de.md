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

## Startende Token

Ein Eintrag in `tokens` kann auch ein Objekt mit `cost` (die Beschriftung unter
dem Feld) und `start` sein, für eine Gesellschaft, die das Spiel mit einem Token
auf diesem Feld beginnt. Ein startender Token liegt bereits auf der Karte, deshalb
zeigt die Charter ihn anders als die übrigen Felder: Der Farbstil zeigt das
Gesellschaftslogo statt eines leeren Kreises, der Carth-Stil, der in jedem Feld
das Logo zeigt, lässt das Feld leer. `start: false` ist dasselbe wie es
wegzulassen, und `cost` ist optional:

```json
{ "abbrev": "RED", "tokens": [{ "cost": "Home", "start": true }, 40, 100] }
```

Eine Gesellschaft kann auch `loans` haben, zusätzliche Felder auf ihrer
Gesellschaftskarte, zum Beispiel für die Kredite eines Spiels. Jeder Eintrag ist
die Beschriftung unter dem Feld, und jedes Feld wird als leeres Quadrat im
Hauptteil der Gesellschaftskarte gedruckt, rechts unter der Kopfzeile, in
Spalten, die in die Höhe der Gesellschaftskarte passen, damit es nie mit einem Token verwechselt wird. Eine leere
Zeichenkette oder `null` lässt das Feld ohne Beschriftung:

```json
{ "abbrev": "RED", "tokens": [0, 40], "loans": [50, 50, ""] }
```

Der erste Kredit steht in der rechten Spalte, und die Kredite füllen sie von oben nach unten und gehen dann in der Spalte links davon weiter. Kredite, die nicht passen, werden abgeschnitten; halte die Anzahl bei Minors und Gesellschaftskarten halber Breite daher klein.

## Token unter dem Namen

Eine Gesellschaft mit vielen Tokens kann `tokensBelow` setzen, um ihre Tokenfelder
in einer Reihe unter dem Namen statt rechts davon zu drucken, damit sie den Namen
nicht zusammendrücken. Die Tokens werden kleiner, damit sie in die Breite der
Gesellschaftskarte passen, und der Name hat Platz für eine Zeile, also halte ihn kurz und lass den Untertext weg. Gesellschaftskarten halber Breite stapeln ihre Tokens
bereits und ignorieren die Einstellung:

```json
{
  "abbrev": "RED",
  "tokens": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  "tokensBelow": true
}
```
