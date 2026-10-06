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
  `config` enthalten, das nur für dieses Spiel über deine Einstellungen gelegt
  wird. Das Fenster zeigt und bearbeitet deine Einstellungen, nicht dieses Feld.
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
selbst.

## Abschnitte

Das Auswahlmenü oben im Fenster wählt einen Abschnitt. Jede Einstellung hat im
Fenster eine Bezeichnung und eine Beschreibung, daher ist das hier nur ein
Überblick.

| Abschnitt                 | Was er ändert                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Farben und Gesellschaften | das Farbdesign, das Design der Gesellschaften, Namen und Logos der Gesellschaften, Überschreibungen                 |
| Export                    | ob Exporte für jedes Layout einen Bogen erzeugen                                                                    |
| Layout                    | Papiergröße und Ränder sowie die Druckskalierung, um einen Drucker zu korrigieren, der zu groß oder zu klein druckt |
| Token                     | das Layout und die Größen der Token-Bögen                                                                           |
| Karten                    | was die Karte zeigt (Koordinaten, Markt, Spieler, Rundenanzeige) und wie ihre Seiten geschnitten werden             |
| Plättchen                 | Plättchen-IDs, Farbenblind-Modus, Layout und Breite der Plättchenbögen                                              |
| Aktienmarkt               | Zellengröße, Pfeile und was die Marktseite zeigt                                                                    |
| Gesellschaftskarten       | Stil und Layout der Gesellschaftskarten, Rahmen, Phasentabelle und Zugreihenfolge, Zugkarten                        |
| Karten                    | Anteils- und Kartenstile, Größen, Beschnitt und Abstand, die Würfelkarten                                           |
| Privatgesellschaften      | der Stil der Privatgesellschaften                                                                                   |
| Züge                      | der Stil der Züge und ob sie Bilder zeigen                                                                          |
| Währung                   | wie Geld für jede Art von Betrag geschrieben wird                                                                   |
| Daten                     | deine Konfiguration zurücksetzen, kopieren, herunterladen und importieren                                           |

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
