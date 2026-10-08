# Hex-Editor

Das Bearbeitungsfenster zeichnet ein Kartenfeld, listet auf, was darauf ist,
und gibt jedem Element eigene Felder. So kannst du ein Kartenfeld oder ein
Plättchen bauen, ohne sein JSON zu schreiben. Der **Hex**-Tab bearbeitet die
Gruppe der Karte, die du gewählt hast (siehe [Dateien](/docs/files)), der
**Plättchen**-Tab ein Plättchen des Spiels. Es ist derselbe Editor, und beide
schreiben dieselbe [Hex-Definition](/docs/games/tiles), wie sie in der
Spieldatei steht.

Der Editor schreibt nur, was du änderst. Schlüssel, die er nicht kennt, die
Reihenfolge der Schlüssel und Werte in Kurzform (ein Label, das nur Text ist,
eine Zahl) bleiben, wie sie sind, und nichts wird mit einem Standardwert
aufgefüllt. Die Seite folgt jeder Änderung, und die gedruckten und exportierten
Seiten hängen nicht vom Editor ab.

## Die Zeichnung

Oben zeichnet der Editor das Kartenfeld wie die Karte, mit einer Schaltfläche
an jeder Kante, nummeriert wie die Seiten in der Datei (1 ist die untere Seite
eines Kartenfelds, das nicht gedreht ist). Klicke eine Kante und dann eine
andere, um das Gleis dazwischen zu zeichnen. Klicke dieselbe Kante noch einmal
oder drücke Escape, um abzubrechen. Zwei gegenüberliegende Seiten ergeben ein
Gleis vom Typ `straight`, Seiten mit einer Seite Abstand eine enge Kurve
(`sharp`) und Seiten mit zwei Seiten Abstand eine weite Kurve (`gentle`). Das
neue Gleis ist gewählt, daher erscheinen seine Felder darunter.

Klicke ein Element in der Zeichnung an, um es zu wählen. Die Kantenschaltflächen,
die Elemente und die Schaltflächen darunter lassen sich mit der Tastatur
bedienen.

## Die Elementliste

Unter der Zeichnung hat die Liste eine Zeile für jedes Element des Kartenfelds.
Wähle eine Zeile, um das Element zu bearbeiten, oder nutze die Schaltflächen der
Zeile, um es nach oben oder unten zu schieben (die Reihenfolge ist die
Zeichenreihenfolge), zu kopieren oder zu entfernen. Mit dem letzten Element
einer Art verschwindet auch die ganze Liste aus dem Kartenfeld. _Element
hinzufügen_ am Ende fügt ein neues Element jeder Art hinzu, die Felder hat.

## Der Inspektor

Das gewählte Element zeigt seine Felder im Inspektor. Die wichtigsten sind
sichtbar, die übrigen stehen hinter _Weitere Felder_ (dort sind auch die Felder
für die Platzierung wie `side`, `angle`, `x`, `y` und `percent`, siehe
[Positionierung](/docs/games/positioning)). _Als JSON_ zeigt das Element als
Text und bewahrt auch alles, was das Formular nicht kennt. Die Felder, ihre
Namen und ihre Hilfe stammen aus den [JSON-Schemas](/docs/games/schemas); ein
Feld, das dem Schema hinzugefügt wird, erscheint also ohne neue Version des
Editors.

Manche Elemente haben ein Bedienelement, das besser passt als ein Feld:

| Element                             | Wichtigste Felder                      | Bedienelement                                  |
| ----------------------------------- | -------------------------------------- | ---------------------------------------------- |
| Gleis                               | type, gauge, width, color              | eine Zeichnung zur Wahl der verbundenen Seiten |
| Stadt, mittlere Stadt               | size, name, companies                  |                                                |
| Ort, Mittelort, Boomtown            | name                                   |                                                |
| Außenfeld-Einnahmen                 | name, revenues, rows                   |                                                |
| Label                               | label, size, color                     |                                                |
| Grenze                              | color, dashed, width                   | eine Zeichnung zur Wahl der Seite              |
| Trennlinie, Tunneleingang           |                                        | eine Zeichnung zur Wahl der Seite              |
| Wert, Name, Streckenbonus           | der Text oder die Zahl                 |                                                |
| Symbol                              | width, noCircle                        | eine Liste der Symbole von 18xx Maker          |
| Gelände                             | cost, size                             | eine Liste der Geländearten und Symbole        |
| Form, Ware, Industrie, Gesellschaft | Text, Farben, `top`, `bottom`, `label` |                                                |
| Brücke, Tunnel                      | cost, color, textColor                 |                                                |

Ein Name in der Typliste, den 18xx Maker nicht kennt, etwa der Name eines
eigenen Symbols, bleibt erhalten und wird angezeigt. Ein Token ist Text, eine
Zahl oder eines von mehreren Objekten und hat daher keine Felder: Bearbeite es
im Inspektor als JSON.

## Das Kartenfeld selbst

Unter dem Inspektor stehen die Felder des Kartenfelds: seine Farbe, das `half`
eines abgeschnittenen Kartenfelds, die `stripeRotation` und die Seiten, deren
Grenzen entfernt sind (klicke die Seiten in der kleinen Zeichnung). Im
Plättchen-Tab stehen an derselben Stelle die Felder zum Drucken eines
Plättchens: die Anzahl, wie viele gedruckt werden, und die Gruppe.

## Elemente verschieben

Ziehe eine Stadt, einen Ort, ein Label, ein Symbol oder ein anderes Element, das
an einem Platz sitzt, um es zu verschieben. Das Ziehen ändert sein `x` und `y`
(auf ein Zehntel), was es sonst auch platziert, und ein Element, das die Karte
selbst platziert, bekommt den Platz, den es hat, damit es nicht springt. Gleise,
Grenzen und andere Elemente an einer Kante lassen sich nicht ziehen: Nutze ihre
Zeichnung im Inspektor.

## Rückgängig und Wiederholen

Die zwei Schaltflächen unter der Zeichnung sowie Strg oder Cmd+Z und Strg oder
Cmd+Umschalt+Z (auch Strg oder Cmd+Y) machen Änderungen im Editor rückgängig und
stellen sie wieder her. Ein Ziehen ist ein Schritt. Die Tastenkürzel gelten
nicht, solange der Fokus in einem Feld ist, wo die Tasten dem Feld gehören. Der
Verlauf beginnt für jedes Kartenfeld neu und auch, wenn du zur JSON-Ansicht
wechselst und zurückkehrst.

## Ein Kartenfeld einer Gruppe ändern

Eine Gruppe der Karte ist eine Liste von Koordinaten mit einer gemeinsamen
Definition. Eine Änderung im Hex-Tab gilt daher für alle, und ein Hinweis nennt
die Anzahl. Die Schaltfläche _Nur C11 bearbeiten_ (mit der Koordinate des
Kartenfelds) nimmt das Kartenfeld aus der Gruppe und gibt ihm eine eigene Kopie
der Gruppe, direkt hinter dem Original, damit die Zeichenreihenfolge der Gruppen
erhalten bleibt. Danach gelten deine Änderungen nur für dieses Kartenfeld. Um
ein Kartenfeld wieder in eine Gruppe zu legen, klicke mit Cmd (Strg unter
Windows und Linux) auf die Karte, wie in [Dateien](/docs/files) beschrieben.
Führt auch eine andere Gruppe das Kartenfeld auf, weist ein Hinweis darauf hin,
und die angezeigte Gruppe ist die, die oben gezeichnet wird.

## JSON

Alles, was das Formular nicht kennt, bleibt im JSON. Mit dem Schalter _Formular_
und _JSON_ des Hex-Tabs änderst du die Gruppe als Text: Der Text wird jedes Mal
neu aus der Gruppe geöffnet. Das Formular lässt sich nicht anzeigen, solange der
Text kein gültiges JSON einer Gruppe ist.
