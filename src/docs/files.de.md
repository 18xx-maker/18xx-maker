# Dateien

18xx Maker nutzt viele verschiedene Browsertechniken für den Umgang mit Dateien,
und das kann verwirrend sein. Diese Seite soll helfen, Ordnung in das Geschehen
zu bringen.

## Mitgelieferte Spiele

18xx Maker wird mit einer Reihe von JSON-Dateien geliefert, die fest in die App
und die Website eingebunden sind. Einige Beispiele sind [Shikoku
1889](/games/1889/map) und [The Old Prince 1871](/games/TheOldPrince1871/map).
Diese Spiele werden immer auf der Seite [Spiele laden](/games) aufgelistet. Du
kannst die JSON-Datei herunterladen, um zu sehen, wie die Spiele aufgebaut sind,
über die Schaltfläche „Herunterladen“ (im Web) oder „Speichern“ (in der App) auf
der Informationsseite des Spiels.

Um eine Spieldatei auf Fehler zu prüfen, führe `pnpm maker validate my-game.json`
aus (die Datei wird gegen das Spielschema geprüft, siehe
[JSON-Schemas](/docs/games/schemas)).

## Die 18xx-Maker-App verwenden

In der App kann 18xx Maker auf dein Dateisystem zugreifen. Das bedeutet, du
kannst JSON-Dateien von deinem Computer laden. Spieldateien kannst du auf
mehrere Arten öffnen:

1. Verwende den Menüeintrag „Öffnen“ und wähle eine gültige JSON-Datei aus
1. Drücke von überall in der App die Taste „o“
1. Klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Datei öffnen“
1. Ziehe eine gültige JSON-Datei in das App-Fenster

In allen Fällen speichert die App den Speicherort dieser Datei in ihrem Speicher
und zeigt dann das Spiel an. Du siehst diese Datei jetzt auf der Seite
[Spiele laden](/games) aufgelistet. Das Papierkorb-Symbol auf dieser Seite
löscht die Datei **NICHT**, sondern nur die Erinnerung der App an diese Datei,
und der Eintrag verschwindet von der Seite.

Wenn du die Datei auf deinem Computer verschiebst und versuchst, sie über den
Eintrag auf der Seite [Spiele laden](/games) zu laden, teilt dir die App mit,
dass sie das Spiel nicht finden konnte, und entfernt den Eintrag von der Seite.

Sobald du ein Spiel lädst (über eine der obigen Öffnungsarten oder per Klick auf
den Eintrag einer zuvor geöffneten Datei), lädt die App die neueste Version aus
dem Dateisystem und beginnt außerdem, die Datei zu überwachen. Alle Änderungen
sollten fast sofort in der App sichtbar sein.

## Die 18xx-Maker-Website verwenden

Die Web-Version von 18xx Maker verhält sich etwas unterschiedlich, je nachdem,
ob dein Browser die [File System
API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
unterstützt.

### Unterstützende Browser

Du kannst eine Datei von deinem Computer auf mehrere Arten laden:

1. Drücke von überall in der App die Taste „o“
1. Klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Datei öffnen“
1. Ziehe eine gültige JSON-Datei ins Browserfenster

In allen Fällen speichert der Browser den Speicherort dieser Datei in seinem
Speicher und zeigt dann das Spiel an. Du siehst diese Datei jetzt auf der Seite
[Spiele laden](/games) aufgelistet. Das Papierkorb-Symbol auf dieser Seite
löscht die Datei **NICHT**, sondern nur die Erinnerung des Browsers an diese
Datei, und der Eintrag verschwindet von der Seite.

Wenn du später zur Website zurückkehrst, fragt dein Browser möglicherweise nach
einer Berechtigung, wenn du versuchst, eines dieser Spiele von der Seite
[Spiele laden](/games) zu laden. Wenn du der Datei die Berechtigung nicht
erteilst, wird sie von dieser Seite entfernt, aber du kannst sie jederzeit über
eine der oben genannten Methoden erneut öffnen.

Wenn du die Datei auf deinem Computer verschiebst und versuchst, sie über den
Eintrag auf der Seite [Spiele laden](/games) zu laden, teilt dir die Website
mit, dass sie das Spiel nicht finden konnte, und entfernt den Eintrag von der
Seite.

Der Browser kann eine Datei nicht auf Änderungen überwachen. Wenn du eine Datei
auf diese Weise lädst, erscheint in der Werkzeugleiste eine neue Option „Neu
laden“. Ein Klick darauf sollte die Webseite mit allen lokal an der Datei
vorgenommenen Änderungen aktualisieren. Du kannst auch neu laden, indem du
irgendwo in der App die Taste „r“ drückst, während ein Spiel aus deinem
Dateisystem geladen ist.

### Nicht unterstützende Browser

Auch wenn dein Browser die File System API nicht unterstützt, versuchen wir
stattdessen das [Origin Private File
System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
zu verwenden. Du kannst Dateien auf zwei Arten öffnen:

1. Klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Datei öffnen“
1. Ziehe eine gültige JSON-Datei ins Browserfenster

Danach wird der Inhalt dieser Datei auf deinem lokalen Computer an einer
separaten Stelle gespeichert, die nur der Browser sehen kann. Spiele erscheinen
auf der Seite [Spiele laden](/games). Ein Klick auf das Papierkorb-Symbol auf
dieser Seite löscht die Datei **NICHT** von deinem Computer, sondern lässt den
Browser dieses Spiel vergessen.

Die einzige Möglichkeit, die Datei mit den Daten auf deinem Computer zu
aktualisieren, besteht darin, sie mit einer der obigen Methoden erneut zu öffnen.
