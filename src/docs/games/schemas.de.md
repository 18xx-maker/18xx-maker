# JSON-Schemas

Unsere Schemas sind in [JSON Schema](https://json-schema.org/) Version draft-07
definiert.

## Verwendung

Schemas nutzen wir vor allem, um Funktionen als veraltet zu kennzeichnen. Wenn
wir ein Feld umbenennen, kennt das Schema beide Namen: den neuen und den alten,
der mit `"deprecated": true` markiert ist und in dessen Beschreibung steht,
welchen Namen du verwenden sollst. Eine Spieldatei mit dem alten Namen wird
weiterhin geladen, gedruckt und exportiert, genau wie vorher, und die Seite
Probleme listet den alten Namen als veraltet auf, mit dem neuen Namen. Ein alter
Name wird nie entfernt, deine Spieldateien funktionieren also in jeder Version.
Stehen beide Namen in einer Datei, gilt der neue.

## Aktuelle Schemas

Die Schemas liegen im Verzeichnis
[src/schemas](https://github.com/18xx-maker/18xx-maker/tree/main/src/schemas)
des Quellcode-Repositorys.

- [companies](https://18xx-maker.com/schemas/companies.schema.json) definiert die Gesellschaftsdateien
  zum Ersetzen von Gesellschaften
- [publishers](https://18xx-maker.com/schemas/publishers.schema.json) definiert die Verlagsdatei
- [game](https://18xx-maker.com/schemas/game.schema.json) definiert eine Spieldatei
- [tiles](https://18xx-maker.com/schemas/tiles.schema.json) definiert eine Plättchendatei und wie die Kartenfeld-Definitionen in Spieldateien aussehen
- [config](https://18xx-maker.com/schemas/config.schema.json) - definiert das Format von `defaults.json`, um die
  [Konfigurationsdatei](https://github.com/18xx-maker/18xx-maker/blob/main/src/defaults.json)
  von 18xx Maker und seinen anderen Werkzeugen zu verwalten.
- [theme](https://18xx-maker.com/schemas/theme.schema.json) - Schema zur Definition einer Farbschema-Datei
  (Karten oder Gesellschaften)

Die Schemas game und tiles verweisen beide auf
[tiles.defs.json](https://18xx-maker.com/schemas/tiles.defs.json), das gemeinsam
genutzt wird und alles JSON definiert, was in ein Kartenfeld einer Karte oder
eines Plättchens gehören kann.

## Exportoptionen

Eine Spieldatei kann ein Feld `exports` mit den Standardoptionen für den Export
des Spiels enthalten (Formate, Seiten, Auflösung, Board18-Version und -Autor).
Es ist im Spielschema und unter [Exportoptionen](/docs/games/exports)
beschrieben, und ein ungültiger Wert, etwa eine Auflösung über 300 dpi, führt
zu einem Validierungsfehler.

## Problemseite

Beim Öffnen eines Spiels wird die Datei im Hintergrund gegen das Spielschema
geprüft. Stimmt etwas nicht, erscheint im Spielmenü der Eintrag
Probleme mit der Anzahl der Probleme. Er öffnet eine Liste, die zeigt, wo jedes
Problem liegt, was falsch ist und wie es sich beheben lässt: unbekannte Felder
(ein Tippfehler oder ein Feld, das umbenannt oder entfernt wurde), Werte des
falschen Typs, nicht erlaubte Werte und fehlende Pflichtfelder. Veraltete Felder
werden ebenfalls aufgeführt, sie funktionieren weiterhin, und die Seite nennt den
Namen, der stattdessen zu verwenden ist. Die Seite meldet nur, deine Datei wird nie
verändert. Jede Zeile, die auf eine Stelle der Datei zeigt, verlinkt auf den JSON-Editor im Bearbeitungspanel, an der
Zeile des Problems. Dieselbe Liste ist der Tab Probleme im Bearbeitungspanel, in dem eine Zeile den JSON-Editor an ihrer Zeile öffnet, ohne die Seite zu verlassen.

## Validierung

Um alle Dateien zu validieren, kannst du Folgendes ausführen:

```bash
pnpm validate
```

im Hauptverzeichnis deines Code-Checkouts. Das validiert alle relevanten
JSON-Dateien einschließlich der Schemas selbst. Um deine eigene Spieldatei zu
validieren:

```bash
pnpm maker validate my-game.json
```
