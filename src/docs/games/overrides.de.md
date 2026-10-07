# Gesellschaften austauschen

Du kannst jetzt Listen von Gesellschaften definieren, die du über die regulären
Gesellschaften eines Spiels legst. Wenn du schon immer von 1849 mit deinen
Lieblings-Sportmannschaften oder von 1830 mit deinen Lieblings-Programmiersprachen
geträumt hast ... dann ist dieses Feature genau das Richtige für dich.

## Verwendung

Bearbeite das Feld `overrideCompanies` in der `config.json` oder bearbeite das
Feld auf der Konfigurationsseite. Danach verwendet jedes Spiel, das du dir
ansiehst oder druckst, diese Ersetzungen. Wenn du Bildlogos sehen möchtest,
wähle unbedingt auch eine der Logo-Optionen aus!

Die Gesellschaften werden eins zu eins in der Reihenfolge ersetzt, in der sie in
der Spieldatei und in der Ersetzungsdatei definiert sind. Wenn die Spieldatei
mehr Gesellschaften enthält als die Ersetzungsdatei, bleiben die übrigen in
ihrem Standardzustand.

Das `group` einer Spielgesellschaft bleibt beim Ersetzen erhalten, sodass die
Zeichen der Gruppen weiterhin gedruckt werden.

## Beispiele

Hier findest du die Listen der aktuell [definierten
Ersetzungen](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/companies).
Um neue zu erstellen, lege einfach die JSON-Datei in diesem Ordner an, sie wird
automatisch erkannt (`src/data/index.js` verwendet einen Glob auf
`companies/*.json`). Die Option `overrideCompanies` im Konfigurationsschema ist
allerdings eine geschlossene Liste, also füge den neuen Namen auch zum Enum
`overrideCompanies` in `src/schemas/config.schema.json` (und `public/schemas`)
hinzu, sonst wird die Konfiguration nicht validiert.

Hier ein Beispiel für das Kartenfeld Atlanta der 1832-Karte mit den
Ersetzungen Ruby und Python aus der Liste der Programmiersprachen:

![Das Kartenfeld Atlanta aus 1832 mit einem Ruby-Logo auf der einen und einem Python-Logo auf der anderen Stadt](/images/ruby-and-python-in-atlanta.png "Atlanta in 1832 mit den Ruby- und Python-Ersetzungen.")
