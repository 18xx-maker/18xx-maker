# Kommandozeile

18xx Maker hat ein Kommandozeilenprogramm, `maker`, das Spieldateien validiert
und PDF-, PNG-, SVG- und Board18-Dateien exportiert, ohne die App zu öffnen.

## Voraussetzungen

Die Kommandozeile gehört zum Quellcode, daher brauchst du einen Klon des
Repositorys und einige Werkzeuge. Die Schritte stehen in der
[lokalen Entwicklung](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md).
Kurz gesagt:

```shell
git clone https://github.com/18xx-maker/18xx-maker.git
cd 18xx-maker
pnpm install
pnpm exec playwright install chromium --only-shell
pnpm build
```

- Node 24 oder neuer und [pnpm](https://pnpm.io/installation).
- `pnpm install` installiert die Abhängigkeiten.
- Der Chromium-Browser, den Playwright installiert, zeichnet die Seiten, die
  `export` aufnimmt.
- `pnpm build` baut die Seite nach `dist/site`, die `export` selbst ausliefert.
  Baue erneut, wenn du den Code aktualisierst.

## Ausführen

Führe das Programm mit pnpm oder mit node aus:

```shell
pnpm maker help
node ./bin/maker.js help
```

> [!TIP]
> Um `maker` ohne die eigene Ausgabe von pnpm einzutippen, füge deiner Shell
> einen Alias hinzu: `alias maker='pnpm --silent maker'`.

`maker help <befehl>` erklärt jeden Befehl.

## Befehle

| Befehl                                    | Verwendung                                                      |
| ----------------------------------------- | --------------------------------------------------------------- |
| `export [options] [game]`                 | PDF-, PNG-, SVG- und Board18-Dateien für ein Spiel erstellen    |
| `print [options] [game]`                  | dasselbe wie `export --format pdf`                              |
| `b18 [options] <game> [version] [author]` | dasselbe wie `export --format b18`                              |
| `validate <files...>`                     | eine beliebige 18xx-Maker-JSON-Datei oder ein Schema validieren |
| `config`                                  | die Optionen der Kommandozeile ansehen oder ändern              |
| `compile`                                 | die Schemas kompilieren (für Entwickler)                        |
| `help [command]`                          | Hilfe zu jedem Befehl anzeigen                                  |

### export

```shell
pnpm maker export 1889 --format pdf,png,svg,b18
pnpm maker export path/to/my-game.json
pnpm maker export --all
```

Ein Spiel ist die ID eines mitgelieferten Spiels oder der Pfad einer
Spieldatei. Eine Spieldatei muss das Spielschema bestehen (dieselbe Prüfung wie
bei `validate`). Die Dateien landen in `render/<game>`: die PDF-, PNG- und
SVG-Dateien jeweils in einem Ordner dieses Namens und die Board18-Box daneben.
Mit `--out` wählst du einen anderen Ordner.

Die Optionen sind dieselben wie das Feld `exports` einer Spieldatei und das
Fenster _Exportoptionen_ der App. [Exportoptionen](/docs/games/exports) enthält
die Tabelle der Optionen und Flags und erklärt, welcher Wert gewinnt, wenn der
eingebaute Standardwert, die Spieldatei und deine Flags sich widersprechen. Ein
Flag, das du weglässt, behält den Wert der Spieldatei. Um ihr zu widersprechen,
gib das Flag mit einem anderen Wert an, zum Beispiel `--layouts current`. Die
Flags, die nur davon handeln, wie der Befehl läuft, sind `--config <datei>` (eine
Konfigurationsdatei, siehe [Konfigurationsfenster](/docs/config)),
`--out <ordner>`, `--jobs <n>` (gleichzeitig aufgenommene Dateien), `--all`
(jedes mitgelieferte Spiel) und `--debug` (die Seite auf Port 9000
ausliefern und warten, um sich die Seiten anzusehen).

Exporte ignorieren die Druckskalierung einer Konfiguration: Sie haben immer die
Originalgröße.

### print und b18

`print` ist `export --format pdf` und `b18` ist `export --format b18`. `b18
<game> [version] [author]` nimmt Version und Autor aus der Spieldatei, dann aus
`maker config`. Siehe [Board18-Ausgabe](/docs/output/b18).

### validate

```shell
pnpm maker validate my-game.json "src/data/games/*.json"
```

Prüft jede Datei (Glob-Muster funktionieren) gegen das passende Schema (siehe
[JSON-Schemas](/docs/games/schemas)) und gibt jeden Fehler mit seiner Stelle in
der Datei aus.

### config

`maker config` listet die Optionen der Kommandozeile auf, `maker config file`
gibt die Datei aus, in der sie gespeichert sind, und `maker config get <key>`
sowie `maker config set <key> [value]` lesen und schreiben eine Option. Lässt du
den Wert weg, wird die Option entfernt. Es gibt eine Option: `b18.author`, den
Autorennamen von Board18-Boxen.

### compile

`maker compile` erzeugt die generierte Datei `tiles.defs.json` aus den
Quellen des Plättchenschemas neu. Es ist ein Entwicklerbefehl: Du brauchst ihn
nur, wenn du die Schemas änderst, und dann kopiert `make` sie auch nach
`public/schemas`.

## Exit-Codes

| Code | Bedeutung                                                                                                                                                                                                 |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | alles hat funktioniert                                                                                                                                                                                    |
| `1`  | `export`: einige Dateien sind fehlgeschlagen (die anderen werden trotzdem geschrieben, die fehlgeschlagenen aufgelistet), `validate`: eine Datei ist ungültig                                             |
| `2`  | der Befehl wurde falsch verwendet: ein Spiel, das nicht existiert oder nicht gültig ist, ein Wert außerhalb des Bereichs wie ein `--dpi` über 300, eine unbekannte Option oder die Seite ist nicht gebaut |
