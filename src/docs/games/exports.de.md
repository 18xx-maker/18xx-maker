# Exportoptionen

Eine Spieldatei kann mit einem optionalen `exports`-Feld auf oberster Ebene
festlegen, wie sie exportiert wird. Das sind die Standardwerte für dieses
Spiel, dieselben Optionen, die `maker export` als Flags und das Panel
_Exportoptionen_ der App als Steuerelemente bietet. Eine Spieldatei, die du
weitergibst, wird dann so exportiert, wie du es gemeint hast, ohne dass sich
jemand die Flags merken muss.

```json
{
  "info": { "title": "My Game" },
  "exports": {
    "formats": ["pdf", "png"],
    "docs": ["map", "tiles", "cards", "tokens"],
    "layouts": "current",
    "png": { "dpi": 150 },
    "b18": { "version": "1.2", "author": "Me" }
  }
}
```

Jede Option ist optional, lass einfach weg, was du nicht festlegen möchtest.

## Optionen

| Option        | Flag            | Werte                                                                                                                                                                                                                                                                                           | Standard                                                                           |
| ------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `formats`     | `--format`      | eine Liste aus `pdf`, `png`, `svg` und `b18` (eine Board18-Box)                                                                                                                                                                                                                                 | `["pdf"]`                                                                          |
| `docs`        | `--docs`        | eine Liste von Seiten: `background`, `cards`, `charters`, `map`, `market`, `par`, `revenue`, `tile-manifest`, `tiles` und `tokens`                                                                                                                                                              | jede Seite des Spiels                                                              |
| `layouts`     | `--layouts`     | `all`: eine Datei für jedes Layout der Karten, Plättchen und Token, `current`: nur das Layout der Konfiguration                                                                                                                                                                                 | die Einstellung `export.allLayouts` der Konfiguration                              |
| `background`  | `--background`  | `white` oder `transparent`: der Hintergrund der PNG-Bilder von Karte, Aktienmarkt, Par-Tabelle, Einnahmentabelle und Plättchenübersicht, alle anderen PNGs (die Hintergrundseite, Karten, Gesellschaftskarten, Token und Plättchen) sind immer transparent (nicht bei Board18- und SVG-Bildern) | `white`                                                                            |
| `variation`   | `--variation`   | die Nummer einer Kartenvariante, 0 ist die erste (`--variation all` für alle)                                                                                                                                                                                                                   | alle Varianten                                                                     |
| `png.dpi`     | `--dpi`         | eine ganze Zahl von 1 bis 300                                                                                                                                                                                                                                                                   | `300`, die Größe, in der die Bilder gedruckt werden                                |
| `cards.bleed` | `--card-bleed`  | eine Zahl von 0 bis 50 in 1/100 Zoll (12.5 sind 1/8 Zoll): der Anschnitt um jedes einzelne Karten-PNG, gefüllt mit dem Kartenhintergrund                                                                                                                                                        | `0`, kein Anschnitt                                                                |
| `b18.version` | `--b18-version` | die Version der Board18-Box                                                                                                                                                                                                                                                                     | `1.0`                                                                              |
| `b18.author`  | `--b18-author`  | der Autor der Board18-Box                                                                                                                                                                                                                                                                       | `b18.author` aus `maker config` oder dein Name, in der App der Designer des Spiels |

`docs`, `layouts` und `variation` gelten für die PDF-, PNG- und SVG-Dateien (eine
Board18-Box hat eigene Bilder, berücksichtigt aber die `variation`). `png.dpi`
gilt nur für die PNG-Dateien: Die Bilder einer Board18-Box haben immer einen
Pixel pro Einheit. Die SVG-Dateien (Karte, Aktienmarkt, Par-Tabelle, Einnahmentabelle, Plättchen
und Token) sind transparent und haben keine Auflösung, `png.dpi` und
`background` ändern sie nicht. Die PDF- und SVG-Dateien haben außer den
gemeinsamen keine eigenen Optionen.

Die Optionen dazu, wo und wie der Befehl läuft, gehören nicht zum Spiel:
`--out`, `--jobs`, `--all`, `--config` und `--debug` gibt es nur als Flags.

## Welcher Wert gewinnt

Für jede Option, vom niedrigsten zum höchsten:

1. der eingebaute Standardwert
2. die `exports` der Spieldatei
3. was du auswählst: die Flags von `maker export`, `maker print` und
   `maker b18`, das `b18.author` von `maker config`, deine eigene Konfiguration
   (ihre Einstellung `export.allLayouts` ist die Option `layouts`) und die
   Auswahl im Panel _Exportoptionen_

Ein Spiel mit `"png": { "dpi": 150 }` wird also mit 150 dpi exportiert, mit
`--dpi 300` exportiert derselbe Befehl mit 300 dpi, und das Panel in der App
startet bei 150 und kann vor dem Export geändert werden. Die Optionen werden
einzeln zusammengeführt: `--format pdf` lässt das Spiel sein `png.dpi` nicht
vergessen, und eine `b18.version` im Spiel bleibt erhalten, wenn du nur
`--b18-author` angibst.

### Eine Spieldatei überstimmen

Jede Option hat ein Flag und ein Steuerelement im Panel, und keines von beiden
hat einen eigenen Standardwert: Was du nicht festlegst, ist das, was die
Spieldatei sagt. So gehst du gegen die Spieldatei vor:

| Option        | Flag                                          | Steuerelement im Panel _Exportoptionen_          |
| ------------- | --------------------------------------------- | ------------------------------------------------ |
| `formats`     | `--format pdf,png`                            | die Kontrollkästchen _Formate_                   |
| `docs`        | `--docs map,cards` (die gewünschten Seiten)   | die Kontrollkästchen _Dokumente_                 |
| `layouts`     | `--layouts all` oder `--layouts current`      | _Jedes Layout eines Bogens_                      |
| `background`  | `--background transparent`                    | _Bildhintergrund_                                |
| `variation`   | `--variation 0` oder `--variation all`        | _Kartenvariante_ (nur bei Spielen mit Varianten) |
| `png.dpi`     | `--dpi 96`                                    | _PNG-Auflösung (dpi)_                            |
| `cards.bleed` | `--card-bleed 12.5`                           | _Kartenanschnitt (Einheiten)_                    |
| `b18.version` | `--b18-version 2.0` (`maker b18 <game> 2.0`)  | _Board18-Version_                                |
| `b18.author`  | `--b18-author Me` (`maker b18 <game> 2.0 Me`) | _Board18-Autor_                                  |

Das Panel startet mit den Werten der Spieldatei, und _Auf die Optionen des
Spiels zurücksetzen_ stellt sie wieder her, nachdem du sie geändert hast.

`maker print` exportiert immer PDF-Dateien und `maker b18` immer eine
Board18-Box, egal was `formats` sagt. `maker b18` übernimmt Version und Autor
aus der Spieldatei, wenn du sie weglässt. Verwende `maker export` für die
anderen Optionen.

Das PDF von Karte, Aktienmarkt, Par-Tabelle und Einnahmentabelle gibt es auch
als aufgeteilte Version (Seitenaufteilung), aber nur, wenn die Seite nicht auf
eine Seite deines Papiers passt. Dafür gibt es keine Option, und eine in einer
Spieldatei verbliebene Option `paginated` wird ignoriert.

## Prüfen

Die `exports` eines Spiels werden von `pnpm validate` und `maker validate`
anhand des [Spiel-Schemas](/docs/games/schemas) geprüft, und `maker export`
verweigert eine Spieldatei, die diese Prüfung nicht besteht. Eine Auflösung von
mehr als 300 dpi, ein Format oder eine Seite, die es nicht gibt, ein `layouts`,
das weder `all` noch `current` ist, und jede Option, die nicht in der Tabelle
steht, sind Fehler, zum Beispiel:

```
invalid game  my-game.json
#/exports/png/dpi Value in `#/exports/png/dpi` is `301`, but should be `300` at maximum
```

Die App prüft ein Spiel, das sie öffnet, nicht. Sie überspringt eine ungültige
Option und verwendet stattdessen den nächsten Wert.

## Beispiele

Nur die Karten und Token als PNGs, zum Weitergeben an eine Druckerei:

```json
"exports": { "formats": ["png"], "docs": ["cards", "tokens"], "png": { "dpi": 300 } }
```

Ein Spiel mit Kartenvarianten, exportiert als Board18-Box der zweiten Variante:

```json
"exports": { "formats": ["b18"], "variation": 1, "b18": { "version": "2.0" } }
```

Alles, als was ein Spiel exportiert werden kann, mit einem Bogen für jedes
Layout:

```json
"exports": { "formats": ["pdf", "png", "b18"], "layouts": "all" }
```

Eine transparente Karte und ein transparenter Aktienmarkt, in geringerer
Auflösung:

```json
"exports": { "formats": ["png"], "docs": ["map", "market"], "background": "transparent", "png": { "dpi": 150 } }
```

Flags schlagen die Spieldatei. Mit `"png": { "dpi": 150 }` in der Spieldatei:

```bash
pnpm maker export my-game.json --format png            # 150 dpi
pnpm maker export my-game.json --format png --dpi 300  # 300 dpi
pnpm maker export my-game.json --no-paginated          # even if the game says paginated: true
pnpm maker export 1889 --format pdf --config my-config.json
```
