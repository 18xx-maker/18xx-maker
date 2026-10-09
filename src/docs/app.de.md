# Desktop-App und Einstellungen

::: siteonly

## Herunterladen

18xx Maker gibt es auch als Desktop-Anwendung für macOS, Windows und Linux. Die
Oberfläche ist dieselbe wie auf der Website, mit besserer Unterstützung für das
Bearbeiten von Dateien und mehr Exportoptionen (siehe [Aus der 18xx-Maker-App
exportieren](/docs#aus-der-18xx-maker-app-exportieren)). Wenn du an einem
Prototyp für ein eigenes Spiel arbeitest, empfehlen wir sie. Lade die Version
für dein System von der
[Release-Seite](https://github.com/18xx-maker/18xx-maker/releases) herunter und
installiere sie wie jede andere Anwendung.

:::

## Was die App bietet

In der App öffnest du Spieldateien direkt von deinem Computer, und die App
überwacht sie, sodass deine Änderungen sofort sichtbar sind (siehe
[Dateien](/docs/files#die-18xx-maker-app-verwenden)). Exporte werden in einen
Ordner geschrieben, den du auswählst, wie unter
[18xx Maker verwenden](/docs#aus-der-18xx-maker-app-exportieren) beschrieben.

## Menü

Die App hat ein natives Menü. Jedes Tastenkürzel der Seiten hat darin einen
Eintrag, sodass du sie dort findest. `Strg` ist auf macOS `Cmd`. Die Einträge
für das geladene Spiel tun nichts, wenn kein Spiel geladen ist.

- **Datei**: _Öffnen_ (`Strg+O`) öffnet eine Spieldatei, _Zuletzt geöffnet_
  listet die Spiele auf, die du zuvor geöffnet hast, _Speichern_ (`Strg+S`)
  speichert das Spiel, das du bearbeitest, _Exportieren..._ (`Strg+Umschalt+E`)
  öffnet das Exportmenü, _Spiel herunterladen_ (`Strg+Umschalt+D`) speichert
  die Spieldatei, und _Beenden_.
- **Bearbeiten**: die üblichen Befehle zum Rückgängigmachen, Ausschneiden,
  Kopieren und Einfügen, dann _Spiel bearbeiten_ (`Strg+Umschalt+Y`), _Als JSON
  bearbeiten_ (`Strg+J`) und _Feld suchen_ (`Strg+Umschalt+T`).
- **Ansicht**: Neu laden, Entwicklerwerkzeuge, _App-Informationen_ (`Strg+U`),
  _Auf Seiten aufteilen_ (`Strg+Umschalt+P`), _Konfiguration_ (`Strg+Umschalt+C`),
  _Ansicht zurücksetzen_ (`Strg+Umschalt+V`), _Seitenleiste umschalten_
  (`Strg+B`), Zoom und Vollbild.
- **Gehe zu**: _Startseite_ (`Strg+Umschalt+H`), _Spiele laden_ (`Strg+L`),
  _Aktuelles Spiel_ (`Strg+Umschalt+N`), der vorherige und nächste Abschnitt
  oder die Seite (`Strg+Bild auf` und `Strg+Bild ab`), die Abschnitte eines
  Spiels (`Strg+1` bis `Strg+9`, der letzte hat kein Kürzel) und die
  _Elemente_-Seiten.
- **Fenster**: die Fensterbefehle deines Systems.
- **Hilfe**: _Dokumentation_ (`Strg+D`), _Elemente_ (`Strg+E`) und
  _Tastenkürzel_.

Das Menü folgt der Sprache der App.

Auf macOS gibt es zusätzlich das nach der App benannte Menü mit Über und
Beenden. Die Tastenkürzel, die innerhalb der Seiten funktionieren, stehen unter
[Tastenkürzel](/docs#tastenkürzel).

## App-Informationen

Die _App-Informationen_ (im Menü _Ansicht_ oder mit `Strg+U`) zeigen:

- die Versionen deines Systems, von Electron, Chrome und 18xx Maker, die du
  verwendest,
- die Updates (unten),
- die Datei, in der die App aufbewahrt, was sie zum Funktionieren braucht: die
  Spiele, die du geöffnet hast, die zuletzt geöffneten Spiele und die zuletzt
  verwendete Seite, mit ihrem aktuellen Inhalt.

### Updates

Die App sucht beim Start nach einer neuen Version. Ist eine verfügbar, zeigt
die Seitenleiste _Auf_ die neue Version _aktualisieren_, und das Feld _Updates_
auf der Seite App-Informationen hat eine Schaltfläche _Update herunterladen und
installieren_. Die App installiert es und startet neu. Die Schaltfläche _Nach
Updates suchen_ prüft noch einmal. In einem Entwicklungs-Build sind Updates
abgeschaltet.

## Spiele laden

Die Seite [Spiele laden](/games) listet die Spiele, die du geöffnet hast
(_Deine Spiele_), die mitgelieferten Spiele und die Testspiele. Die
Schaltfläche _Datei öffnen_ öffnet eine Spieldatei. Drei Filter grenzen die
Liste ein:

- _Verlag_ und _Autor_: Ein Spiel mit mehreren Autoren wird unter jedem von
  ihnen aufgeführt,
- _Typ_: _Mitgeliefert_ oder _Geladen_. Er erscheint erst, wenn du ein Spiel
  geladen hast.

Ein Filter auf _Alle_ bewirkt nichts. Das Papierkorb-Symbol eines geladenen
Spiels lässt die App es vergessen, es löscht deine Datei nicht.

## Einstellungen

Die Seite [Einstellungen](/settings) (in der Seitenleiste) hat:

- **Design**: _System_, _Hell_ oder _Dunkel_. Exporte sind immer hell, siehe
  die [Fragen und Antworten](/docs/faq).
- **Sprache**: _System_ oder eine der verfügbaren Sprachen. Die Seite zeigt die
  erkannte Sprache und auf welche sie zurückfällt, wenn deine nicht verfügbar
  ist. Siehe [Übersetzung](/docs/translation).
- **Ordner nach dem Export öffnen**: nur in der App. Wenn ein Export fertig ist,
  werden die Dateien in deinem Dateimanager angezeigt.
