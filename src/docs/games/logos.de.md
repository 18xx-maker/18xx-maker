# SVG-Gesellschaftslogos

Standardmäßig verwendet dieses Programm einfarbige Hintergründe und Textbeschriftungen, um Gesellschaftstoken
darzustellen. Wenn du möchtest, kannst du stattdessen
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)-Logos verwenden. SVG ist
das einzige unterstützte Format.

## Optionen für Gesellschaftslogos

Für die Option „Gesellschaftslogos“ auf der [Konfigurationsseite](?config=true) gibt es
vier Einstellungen:

- `none` - Das ist die Standardeinstellung. Hier werden keine SVGs verwendet,
  und die Token werden als einfacher Text auf einem Hintergrund in der
  Gesellschaftsfarbe dargestellt.
- `original` - Hier werden die mitgelieferten SVG-Dateien der Gesellschaften
  unverändert auf weißem Hintergrund verwendet.
- `match` - Hier wird die mitgelieferte SVG-Datei der Gesellschaft verwendet,
  aber jede Farbe wird durch die ähnlichste Farbe aus dem aktuell gewählten
  Gesellschaften-Farbschema ersetzt.
- `main` - Hier wird die mitgelieferte SVG-Datei der Gesellschaft wie bei
  `match` verwendet, zusätzlich wird aber die Hauptfarbe des Logos durch die
  Gesellschaftsfarbe ersetzt, die in der JSON-Datei des Spiels festgelegt ist.

Hier ein paar Beispiele: `none`, `original`, `match` und zuletzt `main`:

![Ein violetter Gesellschaftstoken mit dem Text KO](/images/company-none.png "none")
![Das Gesellschaftslogo auf einem weißen Kreis](/images/company-original.png "original")
![Das Gesellschaftslogo in den Farben des Farbschemas](/images/company-match.png "match")
![Das Gesellschaftslogo in den Farben des Farbschemas und der Gesellschaftsfarbe](/images/company-main.png "main")

## SVG-Dateien erstellen

Du kannst jedes gängige SVG-Programm oder -Verfahren verwenden, um die für den
Modus `original` benötigten SVGs zu erstellen. Wichtig ist nur, dass die
viewBox bzw. der Begrenzungsrahmen des Dokuments ein enger Rahmen um einen Kreis
ist. Ich empfehle, einen Kreis zu verwenden (auch wenn du ihn vor dem Speichern
wieder entfernst), um zu sehen, wie das Logo in einer runden Stadt aussieht.

Denk außerdem daran, dass das Logo auf einem weißen Hintergrund steht. Wenn das
Logo einen einfarbigen Hintergrund haben soll, empfehle ich, diese Farbe über
die viewBox hinausragen zu lassen (Beschnitt), damit es beim Drucken der Token
gut aussieht.

### Farben bearbeiten

Damit die oben beschriebenen Farboptionen funktionieren, musst du allem, was
eine Farbe hat, class-Attribute hinzufügen. Für alles, was eine `fill`-Farbe
hat, fügst du eine Klasse `color-<name>` hinzu. Alles im Logo, das rot ist,
sollte zum Beispiel die Klasse `color-red` haben.

Alles, was die „Hauptfarbe“ eines Logos ist, sollte ZUSÄTZLICH die Klasse
`color-main` haben.

Alles mit einer Linienfarbe sollte `color-stroke-<name>` und gegebenenfalls
auch `color-stroke-main` enthalten (zum Beispiel: `color-stroke-purple`).

## Logos hinzufügen

Benenne das Logo nach dem Kürzel der Gesellschaft, für die es gedacht ist, und
lege es im Ordner
[/src/data/logos](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/logos)
ab. Danach solltest du **sicherstellen, dass du eine Sicherungskopie hast**, und
Folgendes ausführen:

```bash
pnpm svgo
```

Dadurch wird das SVG optimiert und alles Unnötige daraus entfernt. Das ist
erforderlich, damit die React-App es laden kann. Prüfe dein SVG danach bitte
und stelle sicher, dass es noch richtig aussieht. Wenn nicht oder wenn du
Probleme hast, [schreib mir bitte](mailto:kelsin@valefor.com).
