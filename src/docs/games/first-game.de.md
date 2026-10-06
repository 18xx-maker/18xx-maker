# Deine erste Spieldatei

Ein Spiel ist eine einzige JSON-Datei. Nur `info.title` ist laut
[Spielschema](/docs/games/schemas) erforderlich; jeder andere Schlüssel auf
oberster Ebene ist optional und schaltet die Seiten frei, die ihn verwenden. Das
Spielmenü eines geladenen Spiels zeigt die Seiten, für die Daten vorhanden sind:

| Schlüssel                            | Freigeschaltete Seiten           |
| ------------------------------------ | -------------------------------- |
| `map`                                | Karte                            |
| `tiles`                              | Plättchen und Plättchenübersicht |
| `companies`                          | Token und Gesellschaftskarten    |
| `tokens`                             | Token (ohne Gesellschaften)      |
| `stock.market`                       | Aktienmarkt                      |
| `stock.par.values`                   | Par                              |
| `privates`, `trains`, `number_cards` | die Kartenbögen unter Karten     |

Die Seiten Karten, Hintergrund und Einnahmen sind immer vorhanden. `info`
enthält Titel, Designer, Währung und Ähnliches. Wenn du `wip` oder `prototype`
auf `true` setzt, wird ein Banner angezeigt, dass das Spiel unfertig ist.

## Ein kleiner Startpunkt

Diese Datei ist gültig und enthält eine Karte, Plättchen, zwei Gesellschaften,
einen Aktienmarkt mit Par-Tabelle, Züge und Phasen. Speichere sie als
`my-game.json`:

```json
{
  "info": {
    "title": "My First 18xx",
    "designer": "Me",
    "currency": "$#"
  },
  "wip": true,
  "companies": [
    {
      "name": "Alpha Railroad",
      "abbrev": "AR",
      "color": "red",
      "tokens": [0, 40, 100]
    },
    {
      "name": "Beta Railway",
      "abbrev": "BR",
      "color": "blue",
      "tokens": [0, 40, 100]
    }
  ],
  "stock": {
    "type": "1D",
    "par": { "values": [60, 70, 80, 90, 100] },
    "market": [[40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160]]
  },
  "trains": [
    { "name": "2", "quantity": 4, "price": 80, "color": "yellow" },
    { "name": "3", "quantity": 3, "price": 180, "color": "green" }
  ],
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    { "name": "3", "limit": 4, "rounds": 2, "tiles": "green", "on": "3" }
  ],
  "tiles": { "7": 3, "8": 3, "9": 3, "57": 2 },
  "map": {
    "hexes": [
      { "color": "plain", "hexes": ["A1", "B1", "C1", "B2"] },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Alphaville" }, "companies": ["AR"] }],
        "hexes": ["A2"]
      },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Betaburg" }, "companies": ["BR"] }],
        "hexes": ["C2"]
      }
    ]
  }
}
```

Ein paar Dinge, die dir auffallen sollten:

- `map.hexes` ist eine Liste von Kartenfeld-Definitionen. Jede hat eine `color`
  und eine Liste von Koordinaten, auf die sie angewendet wird, sodass eine
  Definition viele Kartenfelder färben kann. Mit `companies` in einer Stadt
  wird der Heimat-Token einer Gesellschaft dort platziert.
- `tiles` ordnet einer Plättchennummer zu, wie viele davon existieren.
  Plättchennummern stammen aus den generischen Plättchen, die 18xx Maker
  kennt. [Elemente > Plättchen](/elements/tiles) zeigt sie und auch die
  eigenen Plättchen jedes Spiels, die ein anderes Spiel selbst definieren
  muss.
- `trains` und `phases` sind unter [Phasen und Züge](/docs/games/trains)
  beschrieben.

## Laden und Bearbeiten

Ziehe die Datei in das Fenster oder drücke `o`. [Dateien](/docs/files) erklärt,
was die App und die Website damit machen, auch wie Änderungen sichtbar werden
(die App überwacht die Datei, die Webseite braucht „Neu laden“). Bearbeite das
JSON weiter und lade neu, bis es passt.

Um eine Datei zu prüfen, ohne sie zu öffnen, führe den Validator aus. Er gibt
den Pfad jedes Problems aus:

```bash
pnpm maker validate my-game.json
```

## Wie es weitergeht

- Lies echte Spiele, sie sind die beste Referenz. Speichere ein mitgeliefertes
  Spiel auf der Seite [Spiele laden](/games) ab oder öffne es auf GitHub unter
  [src/data/games](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/games).
  [18Test](https://github.com/18xx-maker/18xx-maker/blob/main/src/data/games/18Test.json)
  ist klein und nutzt die meisten Funktionen, und [Shikoku 1889](/games/1889)
  ist ein vollständiges kleines Spiel.
- [Phasen und Züge](/docs/games/trains)
- [Aktien- & Tokentypen](/docs/games/types)
- [Kartenränder & Linien](/docs/games/borders)
- [Positionierung](/docs/games/positioning)
- [Logos](/docs/games/logos) und [Gesellschaften austauschen](/docs/games/overrides)
- [Exportoptionen](/docs/games/exports), um festzulegen, wie dein Spiel
  exportiert wird
- [JSON-Schemas](/docs/games/schemas), die viele Editoren zum Vervollständigen
  und Prüfen von Spieldateien nutzen können
- [Fragen & Antworten](/docs/faq)
