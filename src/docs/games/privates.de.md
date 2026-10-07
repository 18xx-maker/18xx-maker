# Privatgesellschaften

`privates` ist eine Liste mit einer Karte für jede Privatgesellschaft. Die
Karten werden auf der Kartenseite neben den Aktien-, Zug- und Nummernkarten
gedruckt. Nur `name` ist Pflicht. Die Felder stehen im
[Spiel-Schema](https://18xx-maker.com/schemas/game.schema.json).

```json
{
  "privates": [
    {
      "name": "Private with a company",
      "price": 140,
      "revenue": 10,
      "company": "PRR",
      "description": "Description"
    },
    {
      "name": "Private with a token",
      "price": 160,
      "revenue": 15,
      "minPlayers": 3,
      "token": { "color": "green", "label": "3" },
      "description": "Description"
    }
  ]
}
```

## Text

| Feld          | Was gedruckt wird                                      |
| ------------- | ------------------------------------------------------ |
| `name`        | Der Name, oben                                         |
| `id`          | Eine kurze ID wie `P6` in einem Kästchen vor dem Namen |
| `note`        | Eine Textzeile unter dem Namen                         |
| `description` | Der Text der Privatgesellschaft, was sie bewirkt       |
| `variant`     | Eine kleine Beschriftung in der unteren rechten Ecke   |

`idBackgroundColor` ist die Farbe des Kästchens der `id`.

## Preis, Einnahmen und Gebot

- **`price`** ist eine Zahl oder ein Text. Eine Zahl wird mit der Währung
  formatiert (siehe unten), ein Text wie `"Free"` wird unverändert gedruckt.
- **`revenue`** ist eine Zahl, eine Liste von Zahlen (mit einem `/` dazwischen
  gedruckt, für Einnahmen, die sich ändern) oder ein Text wie `"50% / 50%"`. Sie
  werden nach `Revenue:` gedruckt.
- **`bid`** druckt `Min bid:` und den Betrag. Es ist für Privatgesellschaften,
  die versteigert werden.
- **`priceFormat`** und **`revenueFormat`** sind eine Zeichenkette mit einem
  `#`, das durch die Zahl ersetzt wird: `"priceFormat": "#G"` druckt `100G`. Sie
  ersetzen für dieses Feld die `info.currency` des Spiels und gelten nicht, wenn
  der Wert ein Text ist. Ohne sie wird eine Zahl mit der `currency` des Spiels
  gedruckt (zum Beispiel `$#`), wenn die Option `private` der
  Währungseinstellungen auf der Konfigurationsseite an ist, und sonst schlicht.

## Spielerlimits

`minPlayers` und `maxPlayers` beschränken die Privatgesellschaft auf bestimmte
Spielerzahlen. Die Karte druckt `Players: 3-5` (oder `Players: 3`, wenn beide
gleich sind), wenn die Grenzen enger sind als der Bereich der
[Spieler](/docs/games/game-info#spieler) des Spiels, und druckt nichts, wenn die
Privatgesellschaft in jedem Spiel vorkommt.

## Grafiken

Eine Privatgesellschaft kann ein oder mehrere Bilder zeigen, die ihre Wirkung
darstellen. Sie kommen aus diesen Feldern:

- **`hex`** zeichnet das Kartenfeld an dieser Koordinate mit allem, was darauf
  ist. Es hat Vorrang vor einem `tile`.
- **`tile`** zeichnet ein Plättchen anhand seiner ID. Das Plättchen kann eines
  der eigenen Plättchen des Spiels oder ein Alias sein, siehe
  [Plättchen und Felder](/docs/games/tiles).
- **`company`** zeichnet den Token der Gesellschaft mit dieser Abkürzung.
- **`token`** zeichnet einen Token, den du direkt beschreibst. Er nimmt die
  Felder eines Tokens, etwa `color`, `label`, `logo` und `icon`.
- **`icon`** zeichnet ein Symbol aus `src/data/icons` in der `iconColor`.

Beim Privatgesellschaftsstil `big` (siehe die Option für Privatgesellschaften
auf der Konfigurationsseite) werden die Grafiken in der oberen rechten Ecke der
Karte gezeichnet, und der Text läuft um sie herum. Beim Stil `small` stehen sie
in einer Reihe am Anfang der Beschreibung. Bei mehreren bekommt jede einen Teil
der Breite der Reihe.

Das `group` einer Privatgesellschaft ist die ID einer der
[Gruppen](/docs/games/game-info#gruppen) des Spiels. Ihr Zeichen wird in der
oberen rechten Ecke der Namenszeile neben der `id` gezeichnet und gehört nicht
zu den obigen Grafiken.

`iconSize` skaliert alle Grafiken der Karte. Es ist ein Faktor der
Standardgröße: `1.25` ist ein Viertel größer und `0.75` ein Viertel kleiner.
Beim Stil `small` bleibt die Breite innerhalb der Reihe, sodass auch mehrere
Grafiken noch hineinpassen. `18Test.json` hat Privatgesellschaften jeder Größe
zum Vergleichen.

## Fähigkeiten und weitere Felder

`abilities` ist eine Liste von Objekten mit einem `type`. Sie bleibt zur
Referenz in der Datei, zum Beispiel um zu übernehmen, was die
Privatgesellschaft in einem anderen System bewirkt, und wird nicht gedruckt.
`debt`, `sym` und `image` werden vom Schema akzeptiert, aber ebenfalls nicht
gedruckt. Schreib die Regeln, die ein Spieler braucht, in die `description`.

## Schriften und Farben

Jeder Text hat eigene Schriftfelder, die nach dem Textteil benannt sind. Für
`name`, `id`, `note`, `desc` (die Beschreibung), `price`, `revenue`, `bid`,
`variant` und `players` sind das:

| Feld                | Beispiel                      |
| ------------------- | ----------------------------- |
| `<piece>FontFamily` | `"nameFontFamily": "display"` |
| `<piece>FontWeight` | `"descFontWeight": "bold"`    |
| `<piece>FontStyle`  | `"noteFontStyle": "italic"`   |
| `<piece>FontSize`   | `"priceFontSize": 14`         |
| `<piece>Color`      | `"revenueColor": "red"`       |

`FontSize` ist in Punkt und eine ganze Zahl. `fontColor` setzt die Farbe des
gesamten Textes, und eine `<piece>Color` eines Teils hat Vorrang davor.
`backgroundColor` ist die Farbe der Karte (standardmäßig weiß), und
`revenueBackgroundColor` legt einen Hintergrund hinter die Einnahmen. Farben
sind Namen aus dem Gesellschafts-[Farbschema](/docs/games/themes) oder beliebige
CSS-Farben. `playersFontFamily` und die anderen `players`-Felder gestalten die
Zeile `Players:`. Wenn eine lange Beschreibung nicht passt, verkleinere
`descFontSize`.
