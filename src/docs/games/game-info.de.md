# Spielinformationen und Regeln

Das sind die Felder einer Spieldatei, die beschreiben, wie das Spiel gespielt
wird, und welche Seite oder Datei jedes davon speist. Felder, die nur das
Aussehen ändern (Schriften, Größen, Position des Titels), stehen im
[Spiel-Schema](https://18xx-maker.com/schemas/game.schema.json) unter `info` und
werden hier nicht wiederholt. Phasen und Züge stehen unter
[Phasen und Züge](/docs/games/trains).

## Info

`info` ist das eine Objekt, ohne das eine Spieldatei nicht auskommt.

| Feld                 | Was es bewirkt                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`              | Der Name des Spiels: die Infoseite, der Kartentitel und die Hintergrundseite                                                                                                           |
| `subtitle`           | Eine zweite Zeile unter dem Titel auf der Infoseite und der Karte                                                                                                                      |
| `designer`           | Der Designer, auf der Infoseite und der Karte                                                                                                                                          |
| `publisher`          | Die ID eines Verlags aus `src/data/publishers`: sein Logo und Name auf der Infoseite und in der Spieleliste                                                                            |
| `currency`           | Wie Geld geschrieben wird, mit einem `#` an der Stelle der Zahl, etwa `$#` oder `#G`. Preise und Einnahmen verwenden es, wenn die Währungsoptionen auf der Konfigurationsseite an sind |
| `background`         | Die Farbe der Nummernkarten und der Hintergrundseite. `number_cards` (eine Liste von Farben, neben `info`) druckt für jede Farbe einen Satz Nummernkarten                              |
| `marketTokens`       | Wie viele Marktmarker jede Gesellschaft bekommt, standardmäßig 3                                                                                                                       |
| `extraStationTokens` | Wie viele zusätzliche Stationstoken jede Gesellschaft bekommt, zusätzlich zu denen in ihren `tokens`                                                                                   |

## Links

`links` ist ein Objekt mit Webadressen (`http`, `https` oder `mailto`). Die
Infoseite zeigt die, die du setzt: `rules` (die Regeln), `bgg` (die
BoardGameGeek-Seite), `purchase` (wo man das Spiel kaufen kann) und `license`
(die Lizenz des Spiels).

## Spieler

`players` ist eine Liste mit einem Eintrag für jede Spielerzahl. `number` ist
Pflicht, die anderen sind die Zahlen für diese Spielerzahl:

```json
{
  "players": [
    { "number": 3, "certLimit": 20, "capital": 800 },
    { "number": 4, "certLimit": 16, "capital": 600 }
  ]
}
```

- **`number`** ist die Anzahl der Spieler. Die Infoseite zeigt den ersten und
  den letzten Eintrag als Spielerbereich, und eine Privatgesellschaft mit
  `minPlayers` oder `maxPlayers` (siehe
  [Privatgesellschaften](/docs/games/privates)) vergleicht sich mit diesem
  Bereich.
- **`bank`** ist das Geld in der Bank, eine Zahl oder `"∞"`.
- **`capital`** ist das Startkapital jedes Spielers, eine Zahl oder ein Text.
- **`certLimit`** ist die höchste Zahl an Zertifikaten, die ein Spieler halten
  darf. Es ist eine Zahl oder ein Text mit Schrägstrichen wie `"20/16/13"` für
  ein Limit, das sich ändert.

`bank`, `capital` und `certLimit` lassen sich auch einmal für das
ganze Spiel setzen, neben `info` und `players`, für ein Spiel, in dem sie sich
nicht mit der Spielerzahl ändern. In der Spielertabelle auf der Karte wird ein
Wert für das ganze Spiel einmal über alle Spieler hinweg angezeigt, und die
Werte in `players` werden für diese Zeile nicht verwendet.

Die Spielertabelle auf der Karte zeigt `number`, `bank`, `capital` und
`certLimit`, eine Spalte für jeden Eintrag von `players`. Sie wird dort
gezeichnet, wo `map.players` es angibt (siehe
[Plättchen und Felder](/docs/games/tiles)), wenn die Option für die
Spielertabelle bei den Karten auf der Konfigurationsseite an ist.

## Züge

`turns` ist eine Liste der Spielabschnitte, die auf jeder Gesellschaftskarte
gedruckt wird. Jeder Zug hat einen `name` und die `steps` des Zuges, und die
Schritte werden nummeriert, wenn `ordered` wahr ist. `optional` ist eine zweite
Liste von Schritten, die ein Spieler ausführen kann oder nicht:

```json
{
  "turns": [
    {
      "name": "Operating Round",
      "steps": ["Lay or upgrade track", "Run trains", "Purchase trains"],
      "ordered": true,
      "optional": ["Purchase private companies"]
    }
  ]
}
```

## Runden

`rounds` ist die Liste der Runden des Spiels in der Reihenfolge, für die
Rundenanzeige. Jede ist ein Token: ein `label`, eine `color` und die anderen
Felder eines [Tokens](https://18xx-maker.com/schemas/game.schema.json), etwa
`icon`. Die Rundenanzeige wird auf der Karte gezeichnet, wo `map.roundTracker`
es angibt, und auf dem Aktienmarkt, siehe [Aktienmarkt](/docs/games/market). Die
Anzahl der Runden steht auch in der Statistik der Infoseite.

## Phasen

`phases` ist unter [Phasen und Züge](/docs/games/trains) beschrieben. Drei
seiner Felder setzen einen Satz in die Notizen der Phase in der Phasentabelle
der Gesellschaftskarten:

- `buy_companies: true` druckt `Private companies may be purchased.`
- `events.close_companies: true` druckt `Private companies close.`
- `events.remove_tokens: true` druckt `Private tokens removed.`

`events` ist ein Objekt aus Wahrheitswerten. Jedes andere Ereignis, das du
hinzufügst, bleibt in der Datei und wird beim Drucken ignoriert.

## In Arbeit und Prototyp

`wip: true` und `prototype: true` fügen der Infoseite des Spiels jeweils einen
Hinweis hinzu, damit Leute, die ein unfertiges Spiel öffnen, Bescheid wissen.
Keines von beiden ändert eine andere Ausgabe.

## Gruppen

`groups` ist eine Liste von Gruppen von Gesellschaften. Jede wird als kleines
Zeichen gezeichnet, das ihre Mitglieder kennzeichnet: auf den Karten der
Privatgesellschaften, auf den Gesellschaftskarten und auf der Präsidentenaktie
einer Gesellschaft. Gesellschaften und Privatgesellschaften treten einer Gruppe
über die ID in ihrem Feld `group` bei. Gesellschaften und Privatgesellschaften
ohne Gruppe oder mit unbekannter ID werden wie bisher gedruckt.

Eine Gruppe hat eine `id` und optional einen `name` (er wird nicht gedruckt, er
beschriftet die Gruppe bei der Auswahl im Editor), eine `shape` (`circle`,
`diamond`, `ellipse`, `hexagon`, `square` oder `triangle`, standardmäßig
`circle`), eine `color` und `borderColor` sowie einen `text` mit `textColor`.
Ohne `color` ist das Zeichen nur ein Umriss, und die Textfarbe ist standardmäßig
eine, die sich von der `color` abhebt. Die Liste `groups` wird nur als JSON
bearbeitet. Welche Aktie die Präsidentenaktie ist, legt `president` an der Aktie
fest, siehe [Aktien- und Token-Typen](/docs/games/types#die-präsidentenaktie):

```json
{
  "groups": [
    { "id": "east", "name": "Eastern", "shape": "square", "color": "blue" },
    { "id": "west", "shape": "diamond", "color": "black", "text": "W" }
  ],
  "companies": [{ "name": "Blue Railroad", "abbrev": "BLU", "group": "east" }],
  "privates": [{ "name": "Mail Contract", "group": "west" }]
}
```

## Welches Feld was speist

| Feld                                      | Verwendet von                                           |
| ----------------------------------------- | ------------------------------------------------------- |
| `info.title`, `subtitle`, `designer`      | Infoseite, Karte, Hintergrundseite                      |
| `info.publisher`, `links`                 | Infoseite, Spieleliste                                  |
| `info.currency`                           | Jeder Preis und jede Einnahme                           |
| `info.background`, `number_cards`         | Nummernkarten, Hintergrundseite                         |
| `info.marketTokens`, `extraStationTokens` | Tokenseite, Board18-Box                                 |
| `players`                                 | Infoseite (Spielerbereich), Privatgesellschaften, Karte |
| `bank`, `capital`, `certLimit`            | Spielertabelle auf der Karte                            |
| `turns`                                   | Gesellschaftskarten                                     |
| `groups`                                  | Privatkarten, Gesellschaftskarten, Präsidentenaktien    |
| `rounds`                                  | Rundenanzeige auf der Karte und dem Aktienmarkt         |
| `phases`                                  | Phasentabelle auf den Gesellschaftskarten               |
| `wip`, `prototype`                        | Infoseite                                               |

## Entfernte Felder

Diese Felder standen im Schema, aber nichts hat sie zum Drucken verwendet, daher
wurden sie entfernt. Ein Spiel, das noch eines davon enthält, wird weiterhin
geladen und exportiert: Das Feld wird ignoriert und auf der Seite Probleme als
veraltet angezeigt. Lösche es aus der Datei.

- `pools`, `floatPercent` und `upgrades` des Spiels.
- `capitalization` und `mustSellInBlocks` von `info`.
- `subName` einer Gesellschaft.
- `discount` eines Zuges.
- `sym`, `debt`, `abilities` und `image` einer Privatgesellschaft.
- `broken`, `encoding` und `groups` eines Plättchens und seiner Feldelemente.
- `bgFill` und `inverseTextColor` eines Tokens (verwende `inverseLabelColor` für
  die Textfarbe eines inversen Tokens).
- `text` und `textColor` eines Tokens eines Plättchens.
- `textBorderWidth` und `textBorderColor` des Textes eines Plättchenelements.
