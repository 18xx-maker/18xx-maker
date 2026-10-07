# PDF-Ausgabe

## Anwendung

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
gesetzt hast. Der Eintrag _Exportoptionen_ öffnet ein Panel, in dem du die
Formate (PDF, PNG, SVG und Board18), die Dokumente, ob jedes Layout eines Bogens
exportiert wird, und den Ordner festlegst, und exportiert dann alles auf einmal.
Das Panel startet mit den Optionen aus dem Feld `exports` des Spiels, falls es
eines hat (siehe [Exportoptionen](/docs/games/exports)), und was du dort änderst,
hat Vorrang. Drücke im Panel auf _Export abbrechen_, um einen laufenden Export
zu stoppen; bereits fertige Dateien bleiben erhalten.

Wenn du ein ganzes Spiel exportierst, wirst du aufgefordert, einen Ordner
auszuwählen, und die App merkt sich ihn: Der nächste Export öffnet denselben
Ordner (oder den Standardordner, falls er nicht mehr existiert). Die Dateien
kommen in einen Ordner mit der Spiel-ID, darin je ein Ordner für `pdf`, `png`
und `svg`, genau wie in der Kommandozeile. Nach Abschluss des Exports öffnet die
App den entstandenen Ordner, wenn die Einstellung _Ordner nach dem Export
öffnen_ aktiv ist.

## Kommandozeile

> [!IMPORTANT]
> Dieser Ablauf setzt voraus, dass du den Quellcode der App hast und den
> Anweisungen zur [lokalen
> Entwicklung](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
> gefolgt bist.

Du kannst direkt PDF-Dateien erzeugen, indem du Folgendes ausführst:

```bash
pnpm build && pnpm maker export <game> --format pdf
```

Dabei ist `<game>` die ID eines mitgelieferten Spiels oder der Pfad zu einer
Spieldatei (sie wird zuerst gegen das Spielschema geprüft, und der Ordner wird
nach der Datei benannt). Hier zum Beispiel drucke ich 1889:

```bash
pnpm build && pnpm maker export 1889 --format pdf
```

Die PDFs für Karte, Aktienmarkt, Par-Tabelle und Einnahmentabelle gibt es auch
als aufgeteilte PDFs (`-paginated`), wenn sie nicht auf eine Seite deines
Papiers passen.

`pnpm maker print 1889` ist dasselbe (das Spiel ist standardmäßig `1889`).
Weitere nützliche Optionen sind `--docs map,cards`, um nur einige Seiten zu
exportieren, `--layouts all`, um einen Bogen für jedes Layout zu erhalten,
`--variation 1` für eine Kartenvariante, `--config my-config.json` für deine
Konfigurationsdatei, `--out <folder>` für einen anderen Ordner als `render` und
`--jobs 3`, um drei Dateien gleichzeitig zu erfassen. `pnpm maker help export`
listet alle auf.

Jede dieser Optionen kann auch in der Spieldatei im Feld `exports` festgelegt
werden (siehe [Exportoptionen](/docs/games/exports)). Die Spieldatei enthält die
Standardwerte für dieses Spiel, und was du auf der Kommandozeile angibst, hat
Vorrang. Mit `"exports": { "docs": ["map"] }` im Spiel exportiert zum Beispiel
`pnpm maker export my-game.json` nur die Karte, und
`pnpm maker export my-game.json --docs cards` exportiert stattdessen die Karten.
Das Panel _Exportoptionen_ bietet dieselben Optionen als Bedienelemente, startet
mit denen der Spieldatei und hat eine Schaltfläche, um zu ihnen zurückzukehren.

Denk daran, dass dabei die Einstellungen aus dem Konfigurationsbereich im
Browser nicht verwendet werden. Damit deine gedruckte Ausgabe mit dem
übereinstimmt, was du im Browser siehst, öffne das Panel
[Konfiguration](?config=true) und speichere mit „Download config.json“ (oder
kopiere das JSON am Ende) eine Datei, und übergib sie dann mit `--config`:

```bash
pnpm maker export 1889 --format pdf --config my-config.json
```

Eine Konfiguration in `src/config.json` wird ebenfalls verwendet, wobei
`--config` darüber Vorrang hat.

Dadurch wird die App gebaut und anschließend eine Reihe von Dateien im Ordner
`render/1889` erzeugt:

```
render
└── 1889
    └── pdf
        ├── shikoku-1889-background.pdf
        ├── shikoku-1889-cards-miniEuroDie.pdf
        ├── shikoku-1889-charters.pdf
        ├── shikoku-1889-map-paginated.pdf
        ├── shikoku-1889-map.pdf
        ├── shikoku-1889-market-paginated.pdf
        ├── shikoku-1889-market.pdf
        ├── shikoku-1889-par.pdf
        ├── shikoku-1889-revenue-paginated.pdf
        ├── shikoku-1889-revenue.pdf
        ├── shikoku-1889-tile-manifest.pdf
        ├── shikoku-1889-tiles-die.pdf
        └── shikoku-1889-tokens.pdf
```

Jedes Format hat einen eigenen Ordner im Spielordner: PDFs in `pdf`, PNGs in
`png` und SVGs in `svg`. Die Dateien werden nach dem Titel des Spiels benannt (dieselben Namen wie in der
App), der Ordner nach der Spiel-ID, die du eingegeben hast. PDFs werden mit
ihren Hintergründen gedruckt, wie es die App auch tut. Der Befehl endet mit dem
Code 1, wenn einige Dokumente nicht gedruckt werden konnten (die anderen werden
trotzdem geschrieben), und mit dem Code 2, wenn er falsch verwendet wurde, ein
Spiel nicht existiert oder die Seite nicht gebaut wurde.

Wenn du alle Spiele auf einmal bauen möchtest, kannst du Folgendes ausführen:

```bash
pnpm build && pnpm maker export --all --format pdf
```

## Druckskalierung

Wenn dein Drucker etwas zu groß oder zu klein druckt, setze `printScale` in
deiner Konfiguration (oder im Abschnitt _Layout_ des [Konfigurationsfensters](?config=true))
auf einen Prozentwert zwischen 50 und 200. 100 ist die tatsächliche Größe, bei
95 wird alles um 5 % kleiner gedruckt und bei 105 um 5 % größer, in beide
Richtungen. Papiergröße und Ränder bleiben gleich, daher werden die Bögen neu
angeordnet: bei einer kleineren Skalierung passen mehr Plättchen, Marker oder
Karten auf eine Seite, bei einer größeren weniger. Sie skaliert, was du in der
App und im Druckmenü deines Browsers siehst. Exporte (PDF, PNG, SVG und Board18,
aus der App oder von der Kommandozeile) verwenden immer die tatsächliche Größe
und ignorieren sie, ebenso die Board18-Seiten. Es ist eine Einstellung deines
Druckers, daher kann sie nicht in einer Spieldatei gesetzt werden.

Einige Elemente haben eine feste Breite von 8 Zoll und folgen der Skalierung
nicht, wenn sie eine Seite breiter machen würde: der Plättchenbogen für die
Stanze, die Hintergrundseite, die Plättchenübersicht und die Pins der
Kartenbögen. Prüfe die Druckvorschau, bevor du mit einer größeren Skalierung
druckst.

## Doppelseitige Karten

Zugkarten können eine Rückseite haben: gib einem Zug in der Spieldatei ein
`back` (siehe die [Zugfelder](/docs/games/trains#zugfelder)) und setze `duplex`
im Teil _Karten_ der Konfiguration. `off` (Standard) druckt keine Rückseiten,
`long` druckt nach jeder Seite mit Vorderseiten eine Seite mit Rückseiten, und
`separate` druckt erst alle Vorderseiten und dann alle Rückseiten in derselben
Reihenfolge, zum Wenden der Blätter von Hand.

Verwende `long` mit dem Drucker im Duplexmodus, Wenden an der langen Kante: Die
Spalten der Rückseiten werden gespiegelt, sodass jede Rückseite hinter ihrer
Vorderseite landet. Eine Karte ohne Rückseite lässt einen leeren Platz, und eine
Seite ohne jede Rückseite entfällt. Drucke mit 100 % Skalierung und denselben
Schnittlinien und Rändern auf beiden Seiten, ein Drucker, der die Seite
zwischen den Seiten verschiebt, wird nicht ausgeglichen.

Duplex benötigt das freie Kartenlayout, die Stanzlayouts ignorieren es, und die
Seiten stehen im Hochformat. Die Markierungen einer Rückseitenseite liegen auf
der anderen Seite. Es ist eine Einstellung deines Druckers, daher kann sie nicht
in einer Spieldatei gesetzt werden, und der PDF-Export der Karten folgt ihr
ebenfalls. Der PNG-Export der Karten bleibt bei den Vorderseiten.
