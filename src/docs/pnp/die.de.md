# Ellison-Stanze

Um beim Erstellen von 18xx-Spielen zu helfen, habe ich mir am Ende eine
[Ellison Prestige
Pro](https://www.ellisoneducation.com/19101/ellison-prestige-pro-machine)
Stanzmaschine gekauft.

In meinem [Imgur-Album](https://imgur.com/a/ylTCZ5U) kannst du sehen, wie ich
die Maschine zum ersten Mal auf Testpapier ausprobiert habe.

## Stanzformen

Um sie zu benutzen, brauchst du die Maschine selbst und dazu Stanzformen. Ich
habe mir zwei individuelle Stanzformen für mich bestellt:

- [CST25449](https://imgur.com/cH9WNHP) - Acryl-Stanzform für Kartenfelder (4 x 6 pro Bogen)
- [CST25450](https://imgur.com/S0ozCYE) - Acryl-Stanzform für Mini-Euro-Karten (9 pro Bogen)

Mit diesen beiden Nummern kannst du dieselben Stanzformen bestellen, die ich von
der Abteilung für individuelle Stanzformen bekommen habe. Acryl-Stanzformen
bedeuten, dass die Schneidklingen in Acryl statt in Holz eingebettet sind, sodass
du durch die Stanzform hindurch das Material sehen kannst, das du schneidest
(das siehst du in meinem oben verlinkten Album).

## Drucken

### Plättchen

Um Plättchen aus dieser App zu drucken, die zur oben genannten Stanze passen,
wähle „die“ als Plättchen-Layout, entweder in den [Einstellungen](?config=true)
oder indem du die Eigenschaft `tiles.layout` in deiner Konfiguration auf `die`
setzt:

```json
{ "tiles": { "layout": "die" }, "cards": { "layout": "miniEuroDie" } }
```

Ist diese Eigenschaft gesetzt, ist die Seitengröße für Plättchen fest auf 8,5" x
11" eingestellt.

Es gibt außerdem eine Option `smallDie`, die zum Drucken für eine Stanzform
gedacht ist, mit der kleine Plättchen von 1" (von Kante zu gegenüberliegender
Kante) gestanzt werden. Ich besitze diese Stanzform nicht und konnte sie deshalb
nicht vollständig testen.

### Karten

Du kannst die Eigenschaft `cards.layout` auf `dtgDie` oder `miniEuroDie`
setzen, je nachdem, welches Stanzlayout du hast. Genau wie bei Plättchen
überschreibt eine dieser Optionen viele andere Optionen.

## Bestellen

Um individuelle Stanzformen zu bestellen, würde ich Ellison über deren
[Webseite](https://www.ellisoneducation.com/contact) kontaktieren.

Meine Bestellung kostete inklusive Versand 770 \$. Die Maschine selbst kostet
etwa 400 \$, die beiden Stanzformen jeweils etwa 150 \$. Deine genaue Bestellung
kann je nach aktuellen Preisen, den gekauften Stanzformen und dem Lieferort
abweichen. Du kannst auch in der öffentlichen 18xx-Slack-Gruppe nachfragen, denn
dort bilden sich oft Sammelbestellungen, um bei einzelnen Stanzformen einen
riesigen Rabatt zu bekommen.
