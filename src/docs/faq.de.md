# Fragen und Antworten

## Wo werden meine Spiele gespeichert?

Ein mitgeliefertes Spiel ist Teil von 18xx Maker. Ein Spiel, das du öffnest,
wird nirgendwo anders hin kopiert: Die App und unterstützende Browser merken
sich, wo die Datei liegt, andere Browser behalten eine private Kopie. Wenn du
ein Spiel von der Seite [Spiele laden](/games) entfernst, wird deine Datei nie
gelöscht. Siehe [Dateien](/docs/files).

## Meine Änderungen werden nicht angezeigt

Die App überwacht die Datei. Auf der Website drückst du bei einer Datei, die von
deinem Computer geöffnet wurde, im Spielmenü „Neu laden“ (oder `r`); ein Browser
ohne Dateizugriff braucht die erneut geöffnete Datei. Siehe
[Dateien](/docs/files).

## Woher weiß ich, ob meine Spieldatei gültig ist?

Führe `pnpm maker validate <file>` aus (siehe die [CLI-Readme](https://github.com/18xx-maker/18xx-maker/blob/main/src/cli/README.md)).
Es listet jedes Problem mit seinem Pfad in der Datei auf, zum Beispiel
`#/trains/0/quantity`, und beendet sich mit einem Exitcode ungleich null, wenn
eine Datei ungültig ist. Das Spielschema ist nicht vollständig, daher kann eine
Datei gültig sein und trotzdem nicht richtig aussehen. Siehe
[JSON-Schemas](/docs/games/schemas).

## Wie exportiere oder drucke ich?

In der App nutzt du die Export-Schaltfläche oben links auf einer Spielseite:
PDF, PNG, SVG oder Board18 für das ganze Spiel, oder _Exportoptionen_ zur Auswahl. Auf
der Website öffnet die Schaltfläche den Druckdialog deines Browsers. Siehe
[PDF-Ausgabe](/docs/output/pdf), [PNG-Ausgabe](/docs/output/png),
[SVG-Ausgabe](/docs/output/svg) (um Karte, Plättchen oder Token in Inkscape oder
Illustrator zu bearbeiten) und [Board18-Ausgabe](/docs/output/b18). Auch die Kommandozeile kann mit
`maker export` exportieren; ihre Optionen stehen in der CLI-Readme und können in
der Spieldatei gespeichert werden, siehe [Exportoptionen](/docs/games/exports).

## Welche Seitengröße wird verwendet?

Aufgeteilte Seiten verwenden standardmäßig US Letter (8,5 mal 11 Zoll). Die
Größe kann im [Einstellungsbereich](?config=true) geändert werden. Siehe
[18xx Maker verwenden](/docs).

## Wird in Originalgröße gedruckt?

Die Ausgabe wird in physischen Größen erzeugt, drucke also mit einem Maßstab von
100 Prozent und ohne die Option „An Seite anpassen“. PNG-Exporte werden
standardmäßig mit 300 dpi erstellt und tragen ihre Auflösung in sich, sodass sie
in ihrer echten Größe geöffnet werden. Siehe [PNG-Ausgabe](/docs/output/png).

## Exporte sind immer hell, auch im Dunkelmodus. Warum?

Exporte werden immer im hellen Theme gerendert, unabhängig vom Theme deines
Systems, damit die Bilder weiß (oder transparent, wenn du das wählst) und bereit
zum Drucken sind.
