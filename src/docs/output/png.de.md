# PNG-Ausgabe

In der 18xx-Maker-Anwendung kannst du zu jeder Spielkomponente navigieren und
dann auf den Export-Button klicken:

![Werkzeugleiste einer Spielseite mit eingekreistem Export-Button](/images/export-button-light.png "Der Export-Button in der Werkzeugleiste der App.")

> [!NOTE]
> Wenn du 18xx Maker in einem Webbrowser verwendest, beachte bitte, dass es
> diesen Button dort nicht gibt und stattdessen ein Drucker-Symbol erscheint. Er
> öffnet nur das Druckmenü deines Browsers.

![Werkzeugleiste einer Spielseite in einem Webbrowser mit eingekreistem Druck-Button](/images/print-button-light.png "In einem Webbrowser zeigt dieselbe Stelle den Druck-Button.")

Dadurch öffnet sich ein Menü mit Exportoptionen: das ganze Spiel als
PDF-Dokumente, als PNG-Bilder, als SVG-Bilder oder als Board18-Box exportieren. Ein Export auf
diesem Weg berücksichtigt _alle_ Konfigurationsoptionen, die du in der App
gesetzt hast.

Die Bilder von Karte, Aktienmarkt, Par-Tabelle, Einnahmentabelle und
Plättchenübersicht haben einen Rand von einem Viertelzoll (im
Bildhintergrund); jedes andere Bild wird genau auf die Größe der Komponente
zugeschnitten.

Wenn du ein ganzes Spiel exportierst, wirst du aufgefordert, einen Ordner für
alle Dateien auszuwählen. Die Dateien enthalten _zwar_ den Spielnamen, aber wir
empfehlen, einen eigenen Ordner für dieses Spiel anzulegen, damit du den
Überblick behältst. Die Ausgabe eines Spiels als PNG-Bilder ergibt _VIELE_
Bilder. Nach Abschluss des Exports öffnet die App den entstandenen Ordner.

Beim Export eines ganzen Spiels entsteht ein einzelnes Bild für jedes Plättchen,
jede Karte, jede Gesellschaftskarte und jeden Token. Bilder, die direkt zu einer
Gesellschaft gehören, enthalten deren Kürzel, und alle Bilder werden mit einer
aufsteigenden Ziffer nummeriert (für Spiele, in denen zwei Gesellschaften
dasselbe Kürzel haben).

Bilder werden immer im hellen Design gerendert. Sie entstehen mit 300 dpi, der
Auflösung zum Drucken, und tragen ihre Auflösung in sich, sodass sie in
Originalgröße geöffnet werden. Im Panel _Exportoptionen_ kannst du eine
niedrigere Auflösung wählen (1 bis 300 dpi). Eine Spieldatei kann die Auflösung
(und die anderen Exportoptionen) mit `"exports": { "png": { "dpi": 150 } }`
festlegen, siehe [Exportoptionen](/docs/games/exports): Das Panel startet damit.

Ein Bild enthält nur die Pixel, die seine Komponente vollständig abdeckt, es
kann also einen Pixel kleiner sein als seine Größe in Zoll mal Auflösung (eine
Karte von 2,657 mal 1,732 Zoll ist bei 300 dpi 796 mal 518 Pixel groß), aber es
hat nie einen Rand, der teilweise transparent oder mit dem Hintergrund
vermischt ist. Die App und die Kommandozeile erzeugen dieselben Bilder.

## Kommandozeile

> [!IMPORTANT]
> Dieser Ablauf setzt voraus, dass du den Quellcode der App hast und den
> Anweisungen zur [lokalen
> Entwicklung](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
> gefolgt bist.

Du kannst ein Bild für jedes Plättchen, jede Karte, jede Gesellschaftskarte,
jeden Token und die einzelnen Seiten (Hintergrund, Karte, Aktienmarkt, Par,
Einnahmen und Plättchenübersicht) erzeugen, indem du Folgendes ausführst:

```bash
pnpm build && pnpm maker export <game> --format png
```

Dabei ist `<game>` die ID eines mitgelieferten Spiels oder der Pfad zu einer
Spieldatei. Die Dateien werden in `render/<game>` geschrieben und nach dem Titel
des Spiels benannt.

Die Bilder sind zum Drucken gedacht: 300 dpi ist der Standard und zugleich die
höchste Auflösung, eine niedrigere stellst du mit `--dpi` ein (1 bis 300,
`--dpi 301` wird abgelehnt). Die Auflösung wird in die Datei geschrieben, sodass
eine Karte von 2,5 mal 3,5 Zoll in einem Bildbetrachter in dieser Größe geöffnet
wird und in dieser Größe gedruckt wird. Die Farben sind sRGB. Karte,
Aktienmarkt, Par-Tabelle, Einnahmentabelle und Plättchenübersicht liegen auf
Weiß, oder sind mit `--background transparent` transparent; jedes andere Bild
(die Hintergrundseite, Karten, Gesellschaftskarten, Token und Plättchen) ist
immer transparent, und die Bilder einer Board18-Box übernehmen die Einstellung
nicht. Ein Bild mit mehr als 200 Megapixeln (eine riesige Karte bei 300 dpi)
wird nicht erzeugt, der Befehl meldet das, und du kannst die `--dpi` senken. Ein
Dokument, das länger als zwei Minuten braucht, schlägt fehl.

```bash
# Only the cards and the map, at 150 dpi
pnpm maker export 1889 --format png --docs cards,map --dpi 150
```

Das Format, die Seiten und die Auflösung können stattdessen in der Spieldatei
festgelegt werden, mit `"exports": { "formats": ["png"], "docs": ["cards",
"map"], "png": { "dpi": 150 } }`. Ein Flag hat Vorrang vor der Spieldatei und
die Spieldatei vor den Standardwerten, sodass `pnpm maker export my-game.json
--dpi 300` dieses Spiel mit 300 dpi exportiert (und die _PNG-Auflösung (dpi)_
im Panel startet mit dem Wert der Spieldatei und kann geändert werden). Eine
Auflösung über 300 ist auch in der Spieldatei ein Fehler (`pnpm validate` meldet
das). Siehe [Exportoptionen](/docs/games/exports) für alle Optionen.

Denk daran, dass dabei die Einstellungen aus dem Konfigurationsbereich im
Browser nicht verwendet werden, siehe [PDF-Ausgabe](/docs/output/pdf), wie du
deine Konfiguration verwendest. Um eine Komponente stattdessen in
Vektorgrafik-Software zu bearbeiten, siehe [SVG-Ausgabe](/docs/output/svg).
