# Phasen und Züge

Phasen und Züge haben sich in Version 1.0.0 geändert, um die Verhaltensdaten zu
unterstützen, die Programme wie [18xx.games](https://www.18xx.games/) brauchen.

## Phasenfelder

- **name** _erforderlich_ Der Name der Phase
- **limit** _erforderlich_ Die Anzahl Züge, die jede Gesellschaft in dieser
  Phase besitzen darf
- **tiles** _erforderlich_ Die Farbe der Plättchen, die in dieser Phase erlaubt
  sind. Derzeit gibst du nur die höchste Farbe an, und die darunterliegenden
  Farben sind implizit erlaubt. Das entspricht den meisten Phasentabellen, die
  nur die höchste Farbe zeigen.
- **minor** Ein boolescher Wert, der festlegt, dass diese Phase nur für
  Minor-Gesellschaften gilt.
- **company** Eine Zeichenkette mit dem Kürzel einer Gesellschaft, um festzulegen,
  dass diese Phase nur auf der Gesellschaftskarte dieser Gesellschaft angezeigt
  werden soll.
- **train** Wenn der Phasenname dem Namen des zugehörigen Zuges entspricht,
  wird dieses Feld nicht benötigt. Das Feld kann entweder eine einzelne
  Zeichenkette mit dem zugehörigen Zug oder ein Array aller Züge sein, die in
  dieser Phase verfügbar sind. Spiele auf [18xx.games](https://18xx.games) wie
  1844 und 1846 verwenden dies.
- **rounds** Wie viele ORs pro Satz in dieser Phase gespielt werden. Nützlich
  für Spiele wie 1830, in denen sich die Rundenzahl je Phase ändert.
- **on** Welcher Zug den Beginn dieser Phase auslöst: Wird dieser Zug gekauft,
  beginnt die Phase. Das kann ein einzelner Zugname oder ein Array von
  Zugnamen sein. Es kann auch ein einzelnes Objekt (oder ein Array von
  Objekten) sein, wobei jedes Objekt ein Feld `on` (Zugname) und ein Feld
  `index` hat, das angibt, welcher Zug die Phase auslöst.
- **notes** Eine Zeichenkette oder ein Array von Zeichenketten mit Hinweisen zu
  dieser Phase. Einige Hinweise werden aus anderen Feldern ergänzt, dieses Feld
  ist für eigene gedacht.
- **buyCompanies** Ein boolescher Wert, der festlegt, ob Privatgesellschaften
  in dieser Phase gekauft werden dürfen. Der alte Name `buy_companies`
  funktioniert weiterhin.
- **events** Ein Objekt voller boolescher Felder, die festlegen, dass beim
  Auslösen dieser Phase weitere Ereignisse eintreten (etwa das Schließen von
  Privatgesellschaften oder das Entfernen von Token). Das genaue Format dieser
  Ereignisse ist an die Umsetzung der Spiele auf
  [18xx.games](https://18xx.games) gebunden. `closeCompanies` und `removeTokens`
  hießen `close_companies` und `remove_tokens`, die alten Namen funktionieren
  weiterhin.

## Zugfelder

- **name** _erforderlich_
- **quantity** _erforderlich_ Entweder eine Zahl oder die Zeichenkette „∞“, die
  die Anzahl der verfügbaren Züge angibt.
- **quantityLabel** Text für die Spalte Anzahl der Phasentabelle anstelle der
  Anzahl, etwa `5+`. Der alte Name `quantity_label` funktioniert weiterhin.
- **color** _erforderlich_ Die Farbe, die für den Titel dieses Zuges angezeigt
  wird.
- **price** Der Preis dieses Zuges.
- **image** Das Bild für diesen Zug (verfügbare Bilder findest du im Schema, im
  Code oder in der Datei 18Test).
- **phase** Setze dies auf `false`, wenn dieser Zug nicht in Phasentabellen
  erscheinen soll.
- **print** Die Anzahl dieses Zuges, die gedruckt wird. Überschreibt das Feld
  `quantity` für den Druck. Erforderlich, wenn `quantity` auf „∞“ gesetzt ist.
- **upgrade** Die Kosten dieses Zuges, wenn er als Upgrade gekauft wird. Wird mit
  einem Pfeil unter dem Preis angezeigt.
- **tradeIn** Der Wert dieses Zuges beim Eintauschen. Wird in Klammern unter dem
  Preis angezeigt.
- **priceFormat**, **upgradeFormat**, **tradeInFormat** Ein Formatstring für die
  jeweilige Zahl, in dem das erste `#` durch den Wert ersetzt wird: `"#G"` druckt
  `300G`, `"+#"` druckt `+200`. Er ersetzt die Spielwährung und die
  Währungskonfiguration für diesen Wert und wird ignoriert, wenn der Wert ein
  Text ist. Pfeil und Klammern bleiben erhalten. Halte Formate kurz, der Text
  wird nicht verkleinert. Ein Format bei einem Zug einer Gesellschaft braucht
  eine vollständige Zugdefinition mit `color` und Preis: `{ "name",
"priceFormat" }` allein ist ungültig.
- **description** Eine Beschreibung, die auf die Zugkarte gedruckt wird. Nützlich
  für beliebige Informationen zum Spiel.
- **available** Wenn dieser Zug verfügbar wird, sobald ein anderer Zug verkauft
  wird, kannst du diesen Zug hier als Zeichenkette angeben. Ein gutes Beispiel
  sind die D-Züge in 1830, die verfügbar werden, wenn der 6er gekauft wird.
- **variant** Wenn dieser Zug nur in einer Variante verwendet wird, kannst du
  sie hier angeben.
- **rust** Der Name des Zuges, der diesen Zug rostet. Kann ein Array von Namen
  sein. Kann auch ein einzelnes Objekt (oder ein Array von Objekten) sein, wobei
  jedes Objekt ein Feld `on` und ein Feld `index` hat, die angeben, welcher
  Zugname (`on`) und welcher Index dieses Zuges (2 oder höher) das Rosten
  auslöst.
- **phased** Identisch mit `rust`, legt aber fest, dass dieser Zug ausgemustert
  statt gerostet wird.
- **obsolete** Identisch mit `rust`, legt aber fest, dass dieser Zug veraltet
  statt gerostet wird.
- **permanent** Auf false setzen, wenn dieser Zug kein Permanentzug ist. Nicht
  nötig, wenn eines von `rust`, `obsolete` oder `phased` gesetzt ist.
- **players** Eine Spielerzahl, für die dieser Zug verwendet wird _(könnte bald
  wie bei Privatgesellschaften auf min/max Spieler umgestellt werden)_.
- **back** Die Rückseite der Karte dieses Zuges, die hinter die Vorderseite
  gedruckt wird, wenn die Konfiguration
  [duplex](/docs/output/pdf#doppelseitige-karten) aktiv ist. Alle Exemplare
  des Zuges teilen sie. Sie ist entweder eine einfache Rückseite mit einem
  `title` (standardmäßig der Name des Zuges), einem kleineren `text` darunter,
  einer `color` für den Text und einer `backgroundColor`, oder ein vollständiger
  Zug (mit `name` und `color` sowie den obigen Feldern), der wie eine normale
  Zugkarte mit eigenen Werten gedruckt wird, für einen Zug, der auf seiner
  anderen Seite ein anderer Zug ist. Eine vollständige Rückseite übernimmt die
  Zugfelder der Zugseite, aber nicht `title` oder `text`; ihr eigenes `back`
  und `quantity` werden ignoriert. Hinter einem Zug ohne `back` bleibt die
  Karte leer.

## Beispiele

Beispiele für die meisten dieser Felder findest du in der Datei 18Test. Das
folgende Beispiel ist **synthetisch** (es validiert, stammt aber nicht aus einem
mitgelieferten Spiel) und zeigt `on`, `index`, `rust`, `events`, `notes`,
`print` und `available`:

```json
{
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    {
      "name": "3",
      "limit": 4,
      "rounds": 2,
      "tiles": "green",
      "on": "3",
      "buyCompanies": true,
      "notes": "Privates may be bought"
    },
    {
      "name": "5",
      "limit": 2,
      "rounds": 3,
      "tiles": "brown",
      "on": { "on": "5", "index": 2 },
      "events": { "closeCompanies": true }
    },
    { "name": "D", "limit": 2, "tiles": "brown", "on": ["6", "D"] }
  ],
  "trains": [
    { "name": "2", "quantity": 6, "price": 80, "color": "yellow", "rust": "4" },
    { "name": "3", "quantity": 5, "price": 180, "color": "green", "rust": "6" },
    {
      "name": "5",
      "quantity": 3,
      "price": 450,
      "color": "brown",
      "rust": { "on": "D", "index": 2 }
    },
    {
      "name": "D",
      "quantity": "∞",
      "print": 2,
      "price": 1000,
      "color": "brown",
      "available": "6",
      "description": "Cost 800 when trading in a 4, 5 or 6"
    }
  ]
}
```

## Gesellschaftszüge

Eine Gesellschaft kann Züge besitzen, die nicht zum Zugvorrat des Spiels
gehören, zum Beispiel einen Starterzug. Liste sie im Feld `trains` der
Gesellschaft auf. Jeder Eintrag ist eines von:

- ein Zugname (`"4"`), eine Kopie dieses Zugs des Spiels,
- eine Referenz mit Anzahl (`{ "name": "4", "quantity": 2 }`), mehrere Kopien
  eines Zugs des Spiels,
- ein vollständiger Zug (die Felder oben) mit optionalem `quantity` (Standard
  1). Verwende `print` stattdessen, wenn die Anzahl "∞" ist.

Namen, die das Spiel nicht kennt, werden übersprungen. Das sind zusätzliche
Kopien zu `quantity` in den `trains` des Spiels, und sie ändern die
Phasentabelle nie. Setze `trains` auf `false`, um die Beschriftung "Trains" auf
der Gesellschaftskarte auszublenden.

```json
{
  "name": "Awa Railroad",
  "abbrev": "AR",
  "trains": ["2", { "name": "3", "quantity": 2 }]
}
```

Standardmäßig werden die Züge als kleine Zugkarten auf der Gesellschaftskarte
gedruckt. Die Option **Zugkarten** der Gesellschaftskarten-Konfiguration
(`charters.trainCards`) mit dem Wert `cards` druckt sie stattdessen auf dem
Zugkartenbogen. Gesellschaftskarten ohne Platz dafür (halbe Breite) verwenden
immer den Zugkartenbogen. Die Züge auf einer Gesellschaftskarte haben einen
schwarzen Rahmen und runde Ecken wie Karten; die Optionen **Zugkarten-Rahmen**
(`charters.trainCardBorder`) und **Zugkarten mit runden Ecken**
(`charters.trainCardRound`) schalten beides ab.
