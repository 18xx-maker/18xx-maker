# JSON-Schemas

Unsere Schemas sind in [JSON Schema](https://json-schema.org/) Version draft-07
definiert.

## Verwendung

Schemas nutzen wir vor allem, um Funktionen als veraltet zu kennzeichnen. Wenn
wir eine Funktion ändern, sorgen wir meist dafür, dass die alte Syntax nicht
mehr validiert. So wird sofort sichtbar, wo die alte Funktion noch verwendet
wird. Mit der nächsten Hauptversion (mit inkompatiblen Änderungen) entfernen wir
dann den Code, der die alte Variante unterstützt.

Auf diese Weise funktionieren Spieldateien weiter, validieren aber nicht mehr.
Idealerweise können Nutzer ihre Dateien korrigieren und anschließend problemlos
auf die nächste Hauptversion umsteigen, solange ihre Spieldateien validieren.

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
werden ebenfalls aufgeführt, sie funktionieren noch, werden aber in einer
zukünftigen Version entfernt. Die Seite meldet nur, deine Datei wird nie
verändert. Jede Zeile verlinkt auf den JSON-Editor im Bearbeitungsbereich, an der
Zeile des Problems.

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
