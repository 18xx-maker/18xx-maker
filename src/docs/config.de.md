# Konfigurationsfenster

Das Konfigurationsfenster ändert, wie jedes Spiel angezeigt und gedruckt wird:
Farben und Designs, Papiergröße, das Layout von Token, Plättchen, Karten und
Gesellschaftskarten und mehr. Öffne es mit der Schaltfläche _Konfiguration_ in
der Werkzeugleiste einer Spielseite oder von jeder Seite aus mit
[?config=true](?config=true).

## Wie die Konfiguration funktioniert

- **Die Konfiguration ist global.** Die Einstellungen gelten für jedes Spiel,
  das du ansiehst, druckst oder exportierst, nicht nur für ein Spiel. Sie werden
  im lokalen Speicher deines Browsers gespeichert (die App speichert sie auf
  dieselbe Weise).
- **Ein Spiel kann eine eigene `config` haben.** Eine Spieldatei kann ein Feld
  `config` mit Einstellungen nur für dieses Spiel enthalten. Es wird nur dann
  über deine Einstellungen gelegt, wenn _Spiel-Konfiguration erlauben_ aktiv ist
  (Bereich Daten, standardmäßig aus). Ein Spiel kann weder die Druckskalierung
  noch diese Einstellung setzen. Hat ein Spiel eine `config`, die ignoriert
  wird, erscheint in der Werkzeugleiste eine Warnschaltfläche, die den Bereich
  Daten öffnet. Das Fenster zeigt und bearbeitet deine Einstellungen, nicht
  dieses Feld.
- **Nur deine Änderungen werden gespeichert.** Alle anderen Einstellungen folgen
  den Standardwerten, sodass eine neue Version einen Standardwert verbessern
  kann, den du nie angefasst hast.
- **Auch Exporte nutzen sie.** Ein Export verwendet deine Konfiguration, mit
  zwei Ausnahmen: Er wird immer im hellen Design und in Originalgröße
  gerendert (die Druckskalierung unten wird ignoriert). Welche Optionen zu
  Exporten gehören, steht unter [Exportoptionen](/docs/games/exports).

Von der niedrigsten zur höchsten Stufe stammt eine Einstellung aus den
eingebauten Standardwerten, der `config.json`, die der Kommandozeile übergeben
wurde (siehe [Kommandozeile](/docs/output/cli)), dem, was du im Fenster
einstellst, Parametern der Form `?config.<einstellung>=wert` in der Adresse
(zum Beispiel `?config.cards.layout=die`) und zuletzt der `config` des Spiels
selbst (wenn erlaubt).

## Abschnitte

Das Auswahlmenü oben im Fenster wählt einen Abschnitt. Jede Einstellung hat im
Fenster eine Bezeichnung und eine Beschreibung, daher ist das hier nur ein
Überblick.

| Abschnitt                 | Was er ändert                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Farben und Gesellschaften | das Farbdesign, das Design der Gesellschaften, Namen und Logos der Gesellschaften, Überschreibungen                            |
| Export                    | ob Exporte für jedes Layout einen Bogen erzeugen                                                                               |
| Layout                    | Papiergröße und Ränder sowie die Druckskalierung, um einen Drucker zu korrigieren, der zu groß oder zu klein druckt            |
| Token                     | das Layout und die Größen der Token-Bögen                                                                                      |
| Karten                    | was die Karte zeigt (Koordinaten, Markt, Spieler, Rundenanzeige) und wie ihre Seiten geschnitten werden                        |
| Plättchen                 | Plättchen-IDs, Farbenblind-Modus, Layout und Breite der Plättchenbögen                                                         |
| Aktienmarkt               | Zellengröße, Pfeile und was die Marktseite zeigt                                                                               |
| Gesellschaftskarten       | Stil und Layout der Gesellschaftskarten, Rahmen, Phasentabelle und Zugreihenfolge, Zugkarten                                   |
| Karten                    | Anteils- und Kartenstile, Größen, Beschnitt und Abstand, die Würfelkarten                                                      |
| Privatgesellschaften      | der Stil der Privatgesellschaften                                                                                              |
| Züge                      | der Stil der Züge und ob sie Bilder zeigen                                                                                     |
| Währung                   | wie Geld für jede Art von Betrag geschrieben wird                                                                              |
| Daten                     | deine Konfiguration zurücksetzen, kopieren, herunterladen und importieren sowie die eigene Konfiguration eines Spiels zulassen |

## Schriften

Die Einstellung `fonts` legt die Schrift einer Art von Text an einer Stelle
fest. Sie ist noch kein Bedienelement im Fenster: Lege sie in deiner
`config.json`, im JSON, das du im Bereich Daten importierst, in
`?config.fonts...`-Parametern oder in der `config` einer Spieldatei fest.

```json
{
  "fonts": {
    "families": { "fancy": "Georgia, serif" },
    "roles": {
      "body": { "family": "fancy" },
      "title": { "weight": "normal", "style": "italic" },
      "card": { "weight": "bold" }
    }
  }
}
```

- Eine **Rolle** ist eine Art von Text: `body`, `title`, `label`, `revenue`,
  `token`, `price` und `card`. Sie legt eine `family` fest, eine `size` (eine
  Zahl, in den Einheiten der Seite), eine `weight` (`normal`, `bold` oder eine
  Zahl) und einen `style` (`normal`, `italic` oder `oblique`). Jede Einstellung
  ist optional. Eine Rolle beginnt mit der Rolle `body`, und eine nicht gesetzte
  Einstellung behält den Standard des Textes.
- Eine `family` ist ein Name aus `families`, eine der eingebauten `display`,
  `serif` und `sans-serif` oder eine beliebige CSS-Schriftfamilie. Systemschriften
  werden nicht in Exporte eingebettet, siehe [SVG](/docs/output/svg).
- Derzeit legt die Rolle `title` die Namen von Städten, Orten und
  Off-Board-Bereichen fest, und die Rolle `card` Schriftfamilie, Schriftstärke
  und Schriftstil des Textes der Karten der privaten Gesellschaften. Die
  anderen Rollen sind für den Text, der als Nächstes umgestellt wird.
- Die Schriftfelder eines Kachelelements oder einer Spieldatei (wie
  `info.nameFontSize`) haben weiterhin Vorrang vor einer Rolle, daher ändert
  sich kein Spiel von selbst.
- Die Teile von `fonts` werden über die obigen Stufen kombiniert: das
  `fonts.roles.title.weight` eines Spiels und dein `fonts.roles.title.size`
  gelten beide, und das Spiel gewinnt, wenn beide dasselbe festlegen (wenn
  _Spiel-Konfiguration erlauben_ aktiv ist).

## Direktlinks

Ein Abschnitt hat einen Namen in der Adresse, sodass du darauf verlinken
kannst: `?config=true&section=tokens` öffnet das Fenster bei Token. Die Namen
sind `colors`, `export`, `layout`, `tokens`, `maps`, `tiles`, `stock`
(Aktienmarkt), `charters`, `cards`, `privates`, `trains`, `currency` und `data`.
Ein unbekannter Name öffnet Farben und Gesellschaften.

## Konfiguration speichern und teilen

Der Abschnitt Daten zeigt deine Änderungen als `config.json`, die du
herunterladen, kopieren oder mit einer Schaltfläche auf die Standardwerte
zurücksetzen kannst. Um eine Konfiguration woanders zu verwenden, importiere
sie: siehe [Eine config.json importieren](/docs/files#eine-configjson-importieren).
Dieselbe Datei nimmt `--config` der Kommandozeile entgegen.

Wenn nach einer Änderung etwas nicht stimmt, siehe die
[Fragen und Antworten](/docs/faq).
