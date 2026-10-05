# 18xx Maker verwenden

Hallo! Das ist der Dokumentationsbereich von 18xx Maker. Hoffentlich kannst du
damit im Handumdrehen Spielprototypen erstellen. Diese Seite behandelt zwei
häufige Anwendungsfälle. Weitere Informationen findest du in den anderen
Dokumenten, die du über das Seitenmenü links erreichst.

Neu hier? Folge dem [Tutorial zum ersten Spiel](/docs/games/first-game) und
wirf einen Blick in die [FAQ](/docs/faq) für häufige Fragen.

> [!TIP]
> Diese Dokumentation erklärt, wie du 18xx Maker verwendest. Wenn du am Code
> mitarbeiten oder ihn lokal ausführen möchtest, findest du alles in
> [DEVELOPMENT.md](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)
> im Code-Repository.

## Ein Spiel drucken

Am einfachsten druckst du ein Spiel, indem du auf der Website die Komponente
aufrufst, die du drucken möchtest, und die Seite direkt aus dem Browser
druckst. Die Seite wird mit allen aktuellen Einstellungen und Optionen
gedruckt.

Wenn du zum Beispiel eine auf Seiten aufgeteilte Karte für [Shikoku
1889](/games/1889) drucken möchtest, rufst du die [Kartenseite](/games/1889/map)
auf und schaltest in der Werkzeugleiste oben links den Schalter „Auf Seiten
aufteilen“ ein (oder öffnest die [aufgeteilte
Karte](/games/1889/map?paginated=true) direkt). Danach wählst du im Menü deines
Browsers „Drucken“.

Das Spiel wird ohne die Bedienelemente der Seite gedruckt. Du kannst auch die
Funktion deines Systems nutzen, direkt in eine PDF-Datei zu drucken. Standardmäßig
verwendet die Seite für aufgeteilte Elemente US-Letter-Papier. Das kannst du in
den Einstellungen der Seite ändern (diese gelten global, nicht pro Spiel). Wenn
du eine nicht aufgeteilte Komponente drucken möchtest, musst du im Druckdialog
deines Systems die passende Papiergröße einstellen. Andernfalls teilt dein
Betriebssystem den Druck selbst auf Seiten auf (mit schlechten Ergebnissen).

> [!TIP]
> Schau dir unbedingt den [Einstellungsbereich](?config=true) an. Dort kannst du
> anpassen, wie ein Spiel angezeigt und gedruckt wird. Es stehen viele
> Farbthemen zur Verfügung!

### Aus der 18xx-Maker-App exportieren

In der [App](https://github.com/18xx-maker/18xx-maker/releases) gibt es auf
jeder Spielseite oben links in der Werkzeugleiste eine Schaltfläche (neben dem
Schalter „Auf Seiten aufteilen“):

![Werkzeugleiste einer Spielseite mit beschrifteten Elementen: Zurück, Konfiguration, Seite, Export und Seitenaufteilung](/images/export-button-light.png "Die Werkzeugleiste oben links auf jeder Spielseite in der App. Der Export-Button ist eingekreist.")

Ihr Menü enthält diese Einträge:

- Spiel als PDF-Dokumente exportieren
- Spiel als PNG-Bilder exportieren
- Spiel als Board18-Box exportieren
- Exportoptionen

Bei den Einträgen für das ganze Spiel wirst du gebeten, einen Ordner in deinem
Dateisystem auszuwählen, in den alle Dateien geschrieben werden. Die App öffnet
den Ordner, wenn sie fertig ist, sofern die Einstellung _Ordner nach dem Export öffnen_ aktiv ist. Beim Board18-Eintrag landen eine Zip-Datei und
die darin enthaltenen Dateien im Ordner. Um eine einzelne Seite zu exportieren,
verwende _Exportoptionen_ und wähle die gewünschten Dokumente aus.

Während eines Exports wird eine Fortschrittsmeldung angezeigt. Ein vollständiger
Export, der über das Fenster _Exportoptionen_ gestartet wurde, kann dort
abgebrochen werden; bereits geschriebene Dateien bleiben erhalten. Wenn ein
Dokument nicht exportiert werden kann, werden die anderen trotzdem geschrieben,
und die Meldung zeigt den ersten Fehler an.

#### Exportoptionen

Der Eintrag _Exportoptionen_ öffnet ein Fenster, in dem du genau auswählst, was
ein vollständiger Export erzeugt:

- **Formate:** PDF-Dokumente, PNG-Bilder und eine Board18-Box, in beliebiger
  Kombination.
- **Dokumente:** welche Seiten exportiert werden (Karte, Plättchen, Karten,
  Token, ...), für PDF- und PNG-Dateien.
- **Jedes Layout eines Bogens:** eine Datei für jedes Layout der Karten,
  Plättchen und Token, statt nur des Layouts aus deinen Einstellungen.
- **Kartenvariante:** eine Variante oder alle Varianten, für Spiele mit mehr als
  einer Karte.
- **PNG-Auflösung:** von 1 bis 300 dpi. 300 ist der Standardwert und das
  Maximum.
- **Board18-Version und -Autor:** für die Board18-Box.

Das Fenster startet mit dem Feld `exports` der Spieldatei (siehe
[Exportoptionen](/docs/games/exports)), sodass ein Spiel, das du teilst, so
exportiert werden kann, wie es sich der Autor oder die Autorin gedacht hat.
Ändere im Fenster beliebige Werte nur für diesen Export, oder nutze _Auf die
Optionen des Spiels zurücksetzen_, um zurückzukehren. Dieselben Optionen gibt es
als Flags von `maker export` auf der Kommandozeile.

Exporte verwenden dieselben Einstellungen wie die Seite, die du siehst
(einschließlich der eigenen Einstellungen eines Spiels und deiner gespeicherten
Layout-Einstellungen), werden aber immer im hellen Theme gerendert, unabhängig
vom Theme der App. Die Dateien werden nach dem Titel des Spiels benannt.

#### PNG-Bilder

PNG-Bilder werden standardmäßig mit 300 dpi erstellt, der Auflösung zum Drucken,
und tragen diese Auflösung in sich, sodass sich eine Karte in einem
Bildbearbeitungs- oder Druckprogramm in ihrer echten Größe (2,5 mal 3,5 Zoll)
öffnet. Wähle im Fenster oder mit `png.dpi` im Feld `exports` der Spieldatei
eine niedrigere Auflösung. Bilder einer Board18-Box haben immer einen Pixel pro
Einheit, unabhängig von der Auflösung.

## Ein neues Spiel erstellen

> [!NOTE]
> Derzeit kannst du eine Spieldatei weder auf der Website noch in der App
> bearbeiten. Wir arbeiten an dieser Funktion.

Am schnellsten erstellst du ein neues Spiel, indem du mit einer
[Spieldatei](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/games)
beginnst, die dem Spiel ähnelt, das du machen möchtest.

Sobald du eine Spieldatei hast, kannst du sie ins Browserfenster ziehen (oder
von überall auf der Seite die Taste `o` drücken), um sie in deinen Browser zu
laden. Je nach Browser kopieren wir das Spiel in den Browser oder verwenden es
direkt aus deinem Dateisystem. Im Web musst du das Spiel nach Änderungen
entweder erneut laden oder in der Werkzeugleiste „Neu laden“ wählen. Wenn du die
18xx-Maker-App verwendest, lädt die App das Spiel bei jeder Änderung an der
JSON-Datei automatisch neu.

Um eine Spieldatei vor dem Laden auf Fehler zu prüfen, führe `pnpm maker validate
my-game.json` aus (siehe [Dateien](/docs/files)).

Zu lernen, was in der JSON-Datei alles möglich ist, ist nicht ganz einfach.
Nutze bitte die [Elemente](/elements)-Seite, um zu sehen, was man alles auf
einem Plättchen oder einem Kartenfeld machen kann. Die zweitbeste Quelle ist im
Moment eine Frage im [Discord](https://discord.gg/gcYvAjYYfw).

## Tastenkürzel

Wenn du 18xx Maker über die Website oder die App verwendest, stehen diese
Tastenkürzel zur Verfügung (drücke irgendwo `?`, um sie in einem Popup zu sehen):

```keybindings

```
