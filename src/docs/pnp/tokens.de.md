# Token

18xx Maker bietet viele individuelle Möglichkeiten für Token, die du auf der
[Konfigurationsseite](?config=true) einstellen kannst. Diese Seite soll sie
erklären.

## Definitionen

Dieses Werkzeug unterscheidet „Marktmarker“ (Market Tokens) und „Bahnhofstoken“
(Station Tokens). Marktmarker werden auf Aktienmärkten, Par-Tabellen und
Rennstrecken (zum Festhalten der Einnahmen) verwendet. Bahnhofstoken werden für
Bahnhöfe auf der Karte verwendet. „Allgemeine Token“ (General Tokens) sind alle
Token, die auf Spielebene definiert sind, für Privatgesellschaften oder andere
allgemeine Zwecke.

## Optionen in der Spieldatei

In einer Spieldatei kannst du im Hauptfeld `info` zwei Felder angeben, die
festlegen, wie viele Token für Gesellschaften gedruckt werden.

`marketTokens` legt fest, wie viele Marktmarker gedruckt werden, und ist
standardmäßig 3. In einem normalen Spiel mit Par-Tabelle musst du dieses Feld
also nicht angeben. Du kannst dieses Feld auch in der Definition einer
Gesellschaft angeben, um den Wert nur für diese Gesellschaft zu überschreiben.

```json
{
  "info": { "title": "My Game", "marketTokens": 2, "extraStationTokens": 1 },
  "companies": [
    {
      "name": "Blue Railroad",
      "abbrev": "BLU",
      "color": "blue",
      "marketTokens": 4
    }
  ]
}
```

`extraStationTokens` legt fest, wie viele Bahnhofstoken für jede Gesellschaft
zusätzlich zu denen gedruckt werden, die in der Gesellschaft selbst definiert
sind. Du kannst dieses Feld auch bei einer Gesellschaft angeben, um den Wert nur
für diese Gesellschaft zu überschreiben.

## Zweite Zeile

Ein Token kann über oder unter dem Label eine zweite, kleinere Textzeile
anzeigen, zum Beispiel einen Firmennamen oder die Spielreihenfolge. Setze
`label2` im Feld `token` der Firma. `label2Position` ist `"below"` (Standard)
oder `"above"`, und `label2Color` legt die Farbe fest (Standard: die Farbe des
Labels). Logo-Tokens zeigen keinen Text, und Firmen, die als einfache
Kartentokens gezeichnet werden, ignorieren das Feld `token`.

```json
{
  "name": "Berlin Railroad",
  "abbrev": "BR",
  "color": "orange",
  "token": { "label2": "Berlin", "label2Position": "below" }
}
```

## Symbolgröße bei Privatgesellschaften

Das Symbol, der Token, die Gesellschaft, das Plättchen oder das Feld einer
Privatgesellschaft wird in einer Standardgröße gezeichnet. Mit `iconSize` an der
Privatgesellschaft skalierst du es: ein Multiplikator der Standardgröße, `1.5`
ist also anderthalbmal so groß und `0.75` kleiner. Das funktioniert in den
Stilen „small“ und „big“. Im Stil „small“ mit mehreren Grafiken wird die Breite
begrenzt, sodass sie sich weiterhin die Zeile teilen.

```json
{ "name": "Big Icon", "icon": "share", "iconSize": 1.5 }
```

## Optionen in der Werkzeugkonfiguration

Du kannst im Werkzeug die Größe jeder Tokenart festlegen. Die Größen sind in
Hundertstel Zoll angegeben. Standard sind 50 (0,5 Zoll) für Marktmarker und 37,5
(0,375 Zoll) für Bahnhofstoken. Lochstanzen für diese Größen sind relativ leicht
zu finden, und die entstehenden Aufkleber passen gut auf die 15-mm- und
12-mm-Token von [Rails on Boards](https://www.railsonboards.com/).

Wenn du das Token-Layout auf GSP setzt, werden alle Größen auf 0,5 Zoll gesetzt
und die Token so angeordnet, dass sie auf [diesen
Bögen](https://www.amazon.com/Round-Circle-Labels-White-Printer/dp/B0731PSJLR/)
druckfertig sind.

Du kannst dem Werkzeug außerdem sagen, für wie viele der Marktmarker du
Rückseiten haben möchtest. Die drei Einstellungen sind „none“ (keine), „1“ oder
„all“ (alle). Ich bevorzuge Rückseiten für alle Marktmarker, aber die
Vorlieben sind verschieden.

Bitte denk daran, dass Token auf dem Tokenbogen alle einen kleinen Beschnitt
haben, um Schneidefehler zu vermeiden. Auf der Karte sind die Token exakt, aber
auf dem Tokenbogen werden sie mit größeren Kreisen gedruckt, als du im Werkzeug
eingestellt hast. Das ist beabsichtigt.

```json
{
  "tokens": {
    "layout": "free",
    "marketTokenSize": 50,
    "stationTokenSize": 37.5,
    "reverseMarketTokens": "all"
  }
}
```

![Bogen mit runden Gesellschaftstokens: große Marktmarker mit ihren Rückseiten und kleinere Bahnhofstoken](/images/tokens-example.png "Jede Gesellschaft bekommt einen Marktmarker, dessen Rückseite und Bahnhofstoken.")

## Tipps für Print and Play

Ich verwende Token von [Rails on Boards](https://www.railsonboards.com/) (Token
und Zylinder mit 12 mm und 15 mm) und nutze eine [3/8
Zoll](https://www.amazon.com/gp/product/B0090JVDMQ/)- und eine [1/2
Zoll](https://www.amazon.com/gp/product/B0090JVDNA/)-Lochstanze von Amazon.
