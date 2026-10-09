# Eigene Bilder

Du kannst einem Spiel eigene Bilder hinzufügen und sie im JSON des Spiels mit
ihrem Namen verwenden:

- **Symbole** und **Logos** sind [SVG](https://developer.mozilla.org/de/docs/Web/SVG)-Dateien.
  Ein Symbol wird überall verwendet, wo die eingebauten Symbole stehen (das
  `icon` eines Tokens oder der `type` eines Symbol- oder Geländeelements), ein
  Logo als `logo` eines Tokens.
- **Zugbilder** sind PNG-Dateien, die als `image` eines Zuges verwendet werden.

Ein Bild wird als `custom/<name>` verwendet, zum Beispiel `"icon": "custom/star"`.
Der Name ist der Dateiname ohne Endung. Deine Bilder ersetzen nie ein
eingebautes Bild und sind nicht Teil der JSON-Datei des Spiels, sie werden also
nicht mitgegeben, wenn du die Datei teilst.

## Namen

Ein Name beginnt mit einem Buchstaben oder einer Ziffer und besteht dann aus
Buchstaben, Ziffern, Punkten, Bindestrichen und Unterstrichen, höchstens 64
Zeichen. Namen, die Windows reserviert (`con`, `nul`, `com1` und so weiter),
sind nicht erlaubt, und zwei Namen, die sich nur in Groß- und Kleinschreibung
unterscheiden, gelten als derselbe Name.

## Wo die Bilder liegen

- **Desktop-App**: im Ordner `<spiel>.assets` neben der Spieldatei, in den
  Ordnern `icons`, `logos` und `trains`. Ein Spiel `my-game.json` hat seine
  Bilder in `my-game.assets/icons/star.svg`. Du kannst die Dateien auch selbst
  dorthin legen.
- **Web-App**: im Speicher deines Browsers, für Spiele, die du aus deinem
  Dateisystem geöffnet hast oder die der Browser für dich aufbewahrt. Die Bilder
  bleiben auf diesem Computer.
- **Mitgelieferte Spiele** können keine Bilder aufnehmen. Speichere zuerst eine
  Kopie des Spiels.

Bis zu 200 Bilder pro Spiel, zusammen 10 MB, 512 KB für eine SVG und 2 MB für
ein PNG (höchstens 4096 mal 4096 Pixel).

## Bilder hinzufügen

Im Reiter **Bilder** des Spieleditors kannst du Bilder hinzufügen, umbenennen
und löschen und siehst, welche das Spiel verwendet.

Du kannst Bilder auch **auf die App ziehen**, während ein Spiel geöffnet ist:

- Ein **PNG** wird als Zugbild hinzugefügt und heißt wie die Datei.
- Bei einer **SVG** fragt ein Fenster, ob sie ein **Symbol** oder ein **Logo**
  ist und wie sie heißen soll. Gibt es den Namen schon, kannst du das Bild
  ersetzen oder das neue umbenennen.
- Bis zu 20 Dateien auf einmal. Andere Dateiarten und zu große Dateien werden
  gemeldet, der Rest wird trotzdem hinzugefügt.
- Eine einzelne `.json`-Datei wird weiterhin als Spiel geöffnet (oder als
  Einstellungsdatei angewendet).

Ist kein Spiel geöffnet oder ist es ein mitgeliefertes, zeigt die App einen
Fehler und fügt nichts hinzu.

## SVG-Dateien

SVG-Dateien werden vor der Anzeige bereinigt: Skripte, Animationen, Verweise auf
andere Dateien und externe Bilder werden entfernt. Die `color-*`-Klassen der
eingebauten Symbole funktionieren auch in deinen SVGs und folgen so den
Themenfarben. Zeichne Symbole und Logos in einem Quadrat, zentriert auf die
Bildmitte.
