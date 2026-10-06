# Spielseiten

Jedes Spiel hat für alles, was es drucken kann, eine eigene Seite. Alle teilen
sich eine Werkzeugleiste, und jede Seite zeigt ihren Teil des Spiels so, wie er
gedruckt wird. Die Adresse eines Spiels ist `/games/<Spiel-ID>`, die Adresse
einer Seite hängt ihren Namen an, zum Beispiel `/games/18Test/map`.

## Die Seiten

| Seite               | Adresse         | Zeigt                                                                            | Braucht in der Spieldatei |
| ------------------- | --------------- | -------------------------------------------------------------------------------- | ------------------------- |
| Spielinformationen  | (das Spiel)     | Titel, Autor, Verlag, Links, Spieleranzahl und Statistik des Spiels              | `info`                    |
| Karte               | `map`           | Die Karte, eine Variante nach der anderen                                        | `map`                     |
| Aktienmarkt         | `market`        | Den [Aktienmarkt](/docs/games/market) mit Par-Tabelle, Legende und Rundenanzeige | `stock.market`            |
| Token               | `tokens`        | Bögen mit den Token der Gesellschaften und den Token des Spiels                  | `companies` oder `tokens` |
| Plättchen           | `tiles`         | Bögen mit jedem Plättchen, das gedruckt wird, in der jeweiligen Anzahl           | `tiles`                   |
| Karten              | `cards`         | Privatgesellschaften, Aktien, Züge und Zahlenkarten                              |                           |
| Gesellschaftskarten | `charters`      | Eine Gesellschaftskarte für jede Gesellschaft                                    | `companies`               |
| Par                 | `par`           | Die [Par-Tabelle](/docs/games/market#par-tabelle) für sich                       | `stock.par.values`        |
| Einnahmen           | `revenue`       | Die [Einnahmentabelle](/docs/games/market#einnahmentabelle)                      |                           |
| Plättchenübersicht  | `tile-manifest` | Eine Liste der Plättchen mit Nummer und Anzahl                                   | `tiles`                   |
| Hintergrund         | `background`    | Eine Seite mit dem Spieltitel, der sich auf der Hintergrundfarbe wiederholt      |                           |

Eine Seite, für die das Spiel keine Daten hat, ist im Seitenmenü ausgegraut, und
ihre Adresse leitet dich zurück zur Spielinformationen-Seite.

### Spielinformationen

Die Seite, auf der du landest, wenn du ein Spiel öffnest. Sie zeigt Titel,
Autor, Verlag und die Links des Spiels (Lizenz, Bezugsquelle, BoardGameGeek und
Regeln) sowie einen Hinweis, wenn das Spiel ein Prototyp oder in Arbeit ist. Die
Statistik listet die Plättchen nach Farbe und Spurweite, die Größe der Karte und
die Anzahl der Gesellschaften, Privatgesellschaften, Züge, Phasen und Runden auf.
Mit den Schaltflächen bearbeitest du das Spiel ab seinem ersten Abschnitt, lädst
die Spieldatei herunter, lädst sie aus ihrer Datei neu (im Browser, für Spiele,
die du von deinem Computer geladen hast) und entfernst ein Spiel, das nicht
mitgeliefert wird. Unter [Dateien](/docs/files) steht, woher ein Spiel geladen
wird und wie es gespeichert wird.

### Karte

Die Karte des Spiels mit Plättchen, Token, Beschriftungen und Koordinaten, und,
wenn das Spiel sie dort platziert, mit Aktienmarkt, Rundenanzeige und Legende
der Kursbewegung. Ein Spiel mit mehreren Kartenvarianten hat in der
Werkzeugleiste ein Variantenmenü, siehe [unten](#werkzeugleiste). Der Schalter
„Auf Seiten aufteilen“ teilt eine große Karte mit Schnittlinien in Seiten in
Papiergröße auf, damit sie gedruckt und zusammengesetzt werden kann.

### Aktienmarkt

Der Aktienmarkt des Spiels mit Ledges, Legende und, wenn das Spiel sie darauf
platziert, mit Par-Tabelle, Legende der Kursbewegung und Rundenanzeige. „Auf
Seiten aufteilen“ teilt ihn in Seiten in Papiergröße auf. Alles zum Aktienmarkt
steht unter [Aktienmarkt und Par-Tabelle](/docs/games/market).

### Token

Bögen mit den Token jeder Gesellschaft: die Markttoken, die umgekehrten, die
Stationstoken und zusätzliche, gefolgt von den `tokens` des Spiels. Anordnung,
Größen und Anzahl stehen im Teil _Token_ des
[Konfigurationsbereichs](?config=true).

### Plättchen

Jedes Plättchen aus den `tiles` des Spiels so oft, wie es gedruckt wird,
sortiert in Gruppen gleicher Farbe und Spurweite (ein Plättchen kommt mit seinem
Feld `group` in eine eigene Gruppe). Das Layout der Bögen, die Breite eines
Plättchens, die Abstände, der Schnittrand und die Pins stehen im Teil _Plättchen_
der Konfiguration.

### Karten

Alle Karten des Spiels auf Seiten: die Privatgesellschaften, eine Karte für jede
Aktie jeder Gesellschaft, die Züge und Zahlenkarten von 1 bis zur größten
Spieleranzahl des Spiels (ihre Farben kommen aus `number_cards`). Größe und
Layout der Karten stehen im Teil _Karten_ der Konfiguration.

### Gesellschaftskarten

Eine Gesellschaftskarte für jede Gesellschaft, zuerst die Majors, dann die
Minors. Das Layout (frei oder die Stanzlayouts 3x1 und 3x2), die Größe einer
Gesellschaftskarte und die Seiteneinrichtung stehen im Teil _Gesellschaftskarten_
der Konfiguration.

### Par und Einnahmen

Die [Par-Tabelle](/docs/games/market#par-tabelle) und die
[Einnahmentabelle](/docs/games/market#einnahmentabelle) werden für sich gedruckt,
damit du sie ausschneiden und auf den Tisch legen kannst. Beide haben einen
Schalter „Auf Seiten aufteilen“.

### Plättchenübersicht

Ein kleines Bild jedes Plättchens des Spiels mit seiner Nummer und seiner Anzahl,
in einer Spalte für Gelb, Grün, Braun und alle anderen Farben. Sie dient als
Liste, um zu prüfen, ob alle Plättchen vorhanden sind.

### Hintergrund

Eine Seite in der Hintergrundfarbe des Spiels (`info.background`), über die sich
der Spieltitel schräg wiederholt.

## Werkzeugleiste

Die Werkzeugleiste oben links auf jeder Spielseite wird nicht mitgedruckt. Von
links nach rechts:

- **Spielinformationen** geht zurück zur Spielinformationen-Seite des Spiels.
- **Konfiguration** öffnet den [Konfigurationsbereich](?config=true) mit allen
  Druckeinstellungen.
- **Bearbeiten** (`e`) öffnet neben der Seite den Bearbeitungsbereich, siehe
  [Dateien](/docs/files).
- **Neu laden** lädt das Spiel aus seiner Datei neu, nur auf der Website und nur
  für ein Spiel, das du von deinem Computer geladen hast.
- **Änderungen** erscheint, wenn sich das Spiel von seiner Datei unterscheidet.
  Es öffnet die Änderungen-Seite, und die Verlauf-Seite listet die Speicherungen
  der Sitzung auf. Beides wird zusammen mit der Problemprüfung unter
  [Dateien](/docs/files) beschrieben.
- Das **Seitenmenü** wechselt zu einer anderen Seite. Seiten, für die das Spiel
  keine Daten hat, lassen sich nicht wählen, und die Zifferntasten `1` bis `9`
  und `0` wählen die Seiten in der Reihenfolge der Tabelle oben bis zum
  Hintergrund.
- **Drucken** (in der App **Exportieren**) druckt die Seite oder exportiert das
  Spiel, siehe [Exportoptionen](/docs/games/exports).
- Auf der Kartenseite wählt ein **Variantenmenü** eine der `map`-Varianten, wenn
  das Spiel mehrere definiert. Die Auswahl steht als `variation` in der Adresse,
  `?variation=1` ist also die zweite.
- Auf der Seite Karten blendet ein **Filter**-Menü eine Kartenart aus:
  Privatgesellschaften, Aktien, Züge oder Zahlenkarten.
- Auf den Seiten Karte, Aktienmarkt, Par und Einnahmen teilt der Schalter **Auf
  Seiten aufteilen** (`n`) die Seite zum Drucken auf Papier auf, siehe
  [Ein Spiel drucken](/docs).

Die Seiten Token, Plättchen, Karten und Gesellschaftskarten sind immer in Seiten
aufgeteilt und haben diesen Schalter nicht. Auf den Board18-Seiten wird die
Werkzeugleiste nicht angezeigt.

## Adressen

Der Zustand einer Seite steht in ihrer Adresse, damit du sie teilen oder als
Lesezeichen speichern kannst:

- `?paginated=true` zeigt eine Karten-, Aktienmarkt-, Par- oder
  Einnahmenseite in Seiten aufgeteilt.
- `?variation=1` zeigt die zweite Kartenvariante (0 ist die erste).
- `?hidePrivates=true`, `?hideShares=true`, `?hideTrains=true` und
  `?hideNumbers=true` blenden auf der Kartenseite eine Kartenart aus. Verbinde
  sie mit `&`, zum Beispiel `/games/18Test/cards?hidePrivates=true&hideTrains=true`.

Die Adressen der Konfigurations- und Bearbeitungsbereiche stehen unter
[Dateien](/docs/files).

## Einzelne Elemente

Gesellschaftskarten, Token, Karten und Plättchen haben auch eine Seite für ein
einzelnes Element, die der Export einzelner Bilder verwendet und die nicht im
Seitenmenü steht. Siehe [PNG-Ausgabe](/docs/output/png).

## Board18-Seiten

`/games/<id>/b18/map`, `/games/<id>/b18/tiles/<Farbe>` und
`/games/<id>/b18/tokens` sind die Seiten, die der Board18-Export aufnimmt: die
Karte und die Plättchen einer Farbe in Größe und Ausrichtung, die Board18
erwartet, sowie die Token. Sie haben keine Werkzeugleiste. Siehe
[Board18-Ausgabe](/docs/output/b18).
