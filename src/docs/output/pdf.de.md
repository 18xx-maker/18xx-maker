# PDF-Ausgabe

## Anwendung

In der 18xx-Maker-Anwendung kannst du zu jeder Spielkomponente navigieren und
dann auf den Export-Button klicken:

![Der Export-Button in der Werkzeugleiste](/images/export-button.png)

> [!NOTE]
> Wenn du 18xx Maker in einem Webbrowser verwendest, beachte bitte, dass es
> diesen Button dort nicht gibt und stattdessen ein Drucker-Symbol erscheint. Er
> öffnet nur das Druckmenü deines Browsers.

Dadurch öffnet sich ein Menü mit Exportoptionen: das ganze Spiel als
PDF-Dokumente, als PNG-Bilder oder als Board18-Box exportieren. Ein Export auf
diesem Weg berücksichtigt _alle_ Konfigurationsoptionen, die du in der App
gesetzt hast. Der Eintrag _Exportoptionen_ öffnet ein Panel, in dem du die
Formate (PDF, PNG und Board18), die Dokumente, ob jedes Layout eines Bogens
exportiert wird, und den Ordner festlegst, und exportiert dann alles auf einmal.
Das Panel startet mit den Optionen aus dem Feld `exports` des Spiels, falls es
eines hat (siehe [Exportoptionen](/docs/games/exports)), und was du dort änderst,
hat Vorrang. Drücke im Panel auf _Export abbrechen_, um einen laufenden Export
zu stoppen; bereits fertige Dateien bleiben erhalten.

Wenn du ein ganzes Spiel exportierst, wirst du aufgefordert, einen Ordner für
alle Dateien auszuwählen. Die Dateien enthalten _zwar_ den Spielnamen, aber wir
empfehlen, einen eigenen Ordner für dieses Spiel anzulegen, damit du den
Überblick behältst. Nach Abschluss des Exports öffnet die App den entstandenen
Ordner.

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

Die Dateien werden nach dem Titel des Spiels benannt (dieselben Namen wie in der
App), der Ordner nach der Spiel-ID, die du eingegeben hast. PDFs werden mit
ihren Hintergründen gedruckt, wie es die App auch tut. Der Befehl endet mit dem
Code 1, wenn einige Dokumente nicht gedruckt werden konnten (die anderen werden
trotzdem geschrieben), und mit dem Code 2, wenn er falsch verwendet wurde, ein
Spiel nicht existiert oder die Seite nicht gebaut wurde.

Wenn du alle Spiele auf einmal bauen möchtest, kannst du Folgendes ausführen:

```bash
pnpm build && pnpm maker export --all --format pdf
```
