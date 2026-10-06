# Farbschemata

Jede Farbe auf einer Karte, einem Plättchen, einem Token und einer
Gesellschaftskarte stammt aus einem Farbschema. Es gibt zwei Arten, und du wählst
jede davon auf der Konfigurationsseite aus (`theme` und `companiesTheme`):

- **Karten-Farbschemata** (`src/data/themes/maps`) färben Kartenfelder,
  Plättchen, Strecken, Dörfer und alles andere, was auf der Karte gezeichnet
  wird.
- **Gesellschaften-Farbschemata** (`src/data/themes/companies`) färben die
  Gesellschaften: Token, Gesellschaftskarten, Marktmarker und
  Gesellschaftsfelder.

Um ein neues Farbschema zu erstellen, lege eine JSON-Datei im passenden Ordner
an. Sie wird automatisch erkannt (`src/data/index.js` verwendet einen Glob auf
`themes/**/*.json`), und der Dateiname (ohne `.json`) ist die ID des
Farbschemas.

## Farbschema-Dateien

Ein Farbschema besteht aus einem `name` und einem `colors`-Objekt und wird
durch das [Farbschema-Schema](https://18xx-maker.com/schemas/theme.schema.json)
validiert:

```json
{
  "name": "My Theme",
  "colors": {
    "yellow": "#fdd800",
    "green": "#91be2e",
    "black": "#110a0c",
    "white": "#fff"
  }
}
```

Farben sind Hex-Zeichenketten (`#fff`, `#ffffff`, `#ffffff80`) oder
`rgb(1,2,3)` ohne Leerzeichen. Führe `pnpm validate` aus, um deine Datei zu
prüfen.

Ein Karten-Farbschema wird für sich allein verwendet und muss deshalb jede Farbe
definieren, die die Karte braucht: Kopiere ein vorhandenes (`gmt` ist der
Standard) und bearbeite es. Wenn das gewählte Karten-Farbschema nicht gefunden
wird, wird `gmt` verwendet. Bei Gesellschaften-Farbschemata ist das anders,
siehe unten.

## Kontexte und Phasen

Ein Wert in `colors` kann eine Farbe sein oder ein Objekt, das Farben nach
Kontext gruppiert. Derselbe Name kann je nach dem, was gerade gezeichnet wird,
eine andere Farbe haben:

```json
{
  "colors": {
    "black": "#37383a",
    "track": {
      "default": "#656565",
      "yellow": "#ffc004",
      "green": "#92d051"
    },
    "tile": { "plain": "#d9d9d9", "border": { "yellow": "#d9d9d9" } }
  }
}
```

- Gruppen wie `map`, `tile`, `track`, `town`, `city` und `border` werden nur
  von den Teilen der Zeichnung verwendet, die sie anfragen. Wenn die Gruppe die
  gesuchte Farbe enthält, wird sie verwendet, andernfalls die Farbe der obersten
  Ebene.
- Wenn der endgültige Wert ein Objekt ist, handelt es sich um eine
  Nachschlage-Tabelle nach **Phase**. Die Phase ist die Farbe des gerade
  gezeichneten Kartenfelds (`plain`, `yellow`, `green`, `brown`, `gray`, ...),
  und `default` wird verwendet, wenn die Phase keinen Eintrag hat.

Ein vollständiges Beispiel findest du in einem Karten-Farbschema wie
`src/data/themes/maps/moon.json`.

## Gesellschaften-Farbschemata

Gesellschaften-Farbschemata sind eine flache Liste benannter Farben, auf die
eine Gesellschaft in einer Spieldatei mit ihrem Feld `color` verweist:

```json
{
  "name": "DTG",
  "colors": {
    "black": "#1a1919",
    "blue": "#0089c4",
    "lightBlue": "#b9e5fb",
    "red": "#d8222a"
  }
}
```

Das Farbschema `rob` (der Standard) wird immer zuerst geladen, und das gewählte
Farbschema wird darübergelegt, sodass ein Gesellschaften-Farbschema nur die
Farben enthalten muss, die es ändert. Diese Namen werden außerdem als Aliase
akzeptiert: `cyan` (`lightBlue`), `grey` (`gray`), `lightGreen`
(`brightGreen`), `navy` (`navyBlue`) und `purple` (`violet`).

Was eine Gesellschaftskarte als Namen der Gesellschaft druckt, ist eine eigene
Einstellung, siehe [Alias einer Gesellschaft](/docs/games/types).

## Farben in einer Spieldatei

Ein Spiel kann mit dem Feld `colors` eigene Farben hinzufügen. Sie werden über
die gewählten Farbschemata gelegt, sodass ein Spiel sowohl neue Namen
hinzufügen als auch vorhandene ändern kann:

```json
{
  "colors": {
    "PGER_orange": "#cc6433",
    "PGER_green": "#1d4922",
    "water": "#4cb2d7"
  }
}
```

Eine Gesellschaft kann dann `"color": "PGER_orange"` verwenden. Spielfarben
können dieselben Gruppen und Phasen verwenden wie ein Farbschema. Um die Farbe
einer Gesellschaft zu ändern, setze sie in eine `companies`-Gruppe:

```json
{ "colors": { "companies": { "red": "#aa0000" } } }
```
