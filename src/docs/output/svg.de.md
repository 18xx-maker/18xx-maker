# SVG-Ausgabe

SVG-Dateien sind Vektorgrafiken: Du kannst sie in Inkscape, Illustrator oder
Affinity Designer öffnen, bearbeiten und ohne Qualitätsverlust auf jede Größe
skalieren. Ein PNG ist ein Bild einer Komponente, ein SVG behält die Formen, die
Farben und den Text.

In der 18xx-Maker-Anwendung kannst du zu jeder Spielkomponente navigieren und
dann auf den Export-Button klicken:

![Werkzeugleiste einer Spielseite mit eingekreistem Export-Button](/images/export-button-light.png "Der Export-Button in der Werkzeugleiste der App.")

> [!NOTE]
> Wenn du 18xx Maker in einem Webbrowser verwendest, beachte bitte, dass es
> diesen Button dort nicht gibt und stattdessen ein Drucker-Symbol erscheint. Er
> öffnet nur das Druckmenü deines Browsers.

Wähle _Spiel als SVG-Bilder exportieren_ (drücke `s` bei geöffnetem Menü) oder
hake _SVG-Bilder_ im Panel _Exportoptionen_ an. Ein Export auf diesem Weg
berücksichtigt _alle_ Konfigurationsoptionen, die du in der App gesetzt hast. Du
wirst aufgefordert, einen Ordner auszuwählen, und für jede Karte (eine pro
Variante), jeden Aktienmarkt, jede Par-Tabelle, jede Einnahmentabelle, jedes
Plättchen und jeden Token wird eine Datei geschrieben. Die Dateien enthalten den
Spielnamen, und die App öffnet den Ordner nach Abschluss des Exports.

Seiten, die keine einzelne Zeichnung sind, haben kein SVG: die Karten und
Gesellschaftskarten (sie bestehen aus Text und Kästen in HTML), die
Hintergrundseite, die Plättchenübersicht und die Bögen. Exportiere sie als
[PDF](/docs/output/pdf) oder [PNG](/docs/output/png).

## Was in der Datei steht

- Die Datei enthält nur die Zeichnung in der Größe, in der sie gedruckt wird (ein
  Plättchen, das 2 Zoll breit ist, ist 192 Einheiten breit, eine Einheit ist
  1/96 Zoll wie in jedem Vektorprogramm). Sie ist transparent: Es gibt keinen
  Hintergrund und keinen Rand, und die Optionen `dpi` und `background` gelten
  nicht.
- Jede Farbe, Linie und Schrift steht in der Datei selbst (kein Stylesheet und
  keine Klassen), daher sieht sie in jedem Programm gleich aus.
- Ein Token hat ein SVG für jede Seite und Größe, nebeneinander in einer Datei.
- Bilder werden immer im hellen Design gerendert.

### Schriften

Der Text bleibt Text, du kannst ihn also weiter ändern. Dafür braucht das
Programm die Schriften, um ihn wie gestaltet anzuzeigen. Die Schriften von 18xx
Maker sind [Bitter](https://fonts.google.com/specimen/Bitter) (Titel und
Zahlen), [Yrsa](https://fonts.google.com/specimen/Yrsa) und
[Lato](https://fonts.google.com/specimen/Lato): Installiere die, die du
verwendest. Ein Kommentar am Anfang jeder Datei listet die Schriften ihres
Textes auf. Ein Programm ohne die Schrift zeigt den Text in einer anderen
Schrift, was seine Breite ändern kann.

Um eine Datei an jemanden ohne die Schriften weiterzugeben oder an eine
Druckerei zu schicken, wandle den Text zuerst in Pfade um: _Pfad > Objekt in
Pfad umwandeln_ in Inkscape, _Schrift > In Pfade umwandeln_ in Illustrator.
Danach lässt sich der Text nicht mehr bearbeiten.

## Kommandozeile

> [!IMPORTANT]
> Dieser Ablauf setzt voraus, dass du den Quellcode der App hast und die
> Anleitung zur [lokalen
> Entwicklung](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
> befolgt hast.

```bash
pnpm build && pnpm maker export <game> --format svg
```

Dabei ist `<game>` die ID eines mitgelieferten Spiels oder der Pfad zu einer
Spieldatei. Die Dateien werden nach `render/<game>/svg` geschrieben und nach dem
Titel des Spiels benannt.

```bash
# Nur die Karte und die Plättchen
pnpm maker export 1889 --format svg --docs map,tiles

# Nur die zweite Variante der Karte
pnpm maker export 1889 --format svg --docs map --variation 1
```

SVG wird nur exportiert, wenn du es verlangst. Um es für ein Spiel immer zu
exportieren, trage es in der Spieldatei ein: `"exports": { "formats": ["pdf",
"svg"] }`, siehe [Exportoptionen](/docs/games/exports). Die Flags `--dpi` und
`--background` ändern nur PNG-Dateien und werden für SVG-Dateien ignoriert.

Denk daran, dass dabei nicht die Optionen der Konfigurationsseite im Browser
verwendet werden, siehe [PDF-Ausgabe](/docs/output/pdf) dazu, wie du deine
Konfiguration verwendest.
