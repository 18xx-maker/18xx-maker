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
der Informationsseite des Spiels. Um eine Kopie zu behalten, die du bearbeiten
und speichern kannst, nutze „Speichern unter...“ im Spielmenü (oder auf der
Seite „Änderungen“): Du wirst nach einem Dateinamen gefragt, eine Kopie des
Spiels in seinem aktuellen Zustand wird gespeichert und geöffnet. Das
mitgelieferte Spiel selbst ändert sich nie.

Um eine Spieldatei auf Fehler zu prüfen, führe `pnpm maker validate my-game.json`
aus (die Datei wird gegen das Spielschema geprüft, siehe
[JSON-Schemas](/docs/games/schemas)).
Alle Befehle stehen auf der Seite [Kommandozeile](/docs/output/cli), und die
Seiten [Konfigurationsfenster](/docs/config) und [Desktop-App](/docs/app)
beschreiben die auf deinem Gerät gespeicherten Einstellungen.

## Die 18xx-Maker-App verwenden

In der App kann 18xx Maker auf dein Dateisystem zugreifen. Das bedeutet, du
kannst JSON-Dateien von deinem Computer laden. Spieldateien kannst du auf
mehrere Arten öffnen:

1. Verwende den Menüeintrag „Öffnen“ und wähle eine gültige JSON-Datei aus
1. Drücke von überall in der App die Taste „o“
1. Klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Datei öffnen“
1. Ziehe eine gültige JSON-Datei in das App-Fenster

Um bei null anzufangen, klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Neues Spiel“. Die App fragt, wo das neue Spiel gespeichert werden soll, schreibt dort ein kleines Spiel (einen Titel und einen Block aus 4 mal 4 Feldern) und öffnet es auf der Karte, bereit zum Bearbeiten. Die neue Datei erscheint in der Liste wie jedes Spiel, das du öffnest.

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

Um bei null anzufangen, klicke auf der Seite [Spiele laden](/games) auf die Schaltfläche „Neues Spiel“. Der Browser fragt, wo das neue Spiel gespeichert werden soll, schreibt dort ein kleines Spiel (einen Titel und einen Block aus 4 mal 4 Feldern) und öffnet es auf der Karte, bereit zum Bearbeiten. Die neue Datei erscheint in der Liste wie jedes Spiel, das du öffnest. Ein Browser, der Dateien nicht auf diese Weise speichern kann (siehe unten), legt das neue Spiel stattdessen im Origin Private File System ab.

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

Die Schaltfläche „Neues Spiel“ auf der Seite [Spiele laden](/games) erstellt an diesem separaten Ort ein kleines Spiel (einen Titel und einen Block aus 4 mal 4 Feldern) und öffnet es auf der Karte, bereit zum Bearbeiten. Mit der Schaltfläche „Herunterladen“ auf der Spielseite bekommst du eine Kopie als Datei.

Danach wird der Inhalt dieser Datei auf deinem lokalen Computer an einer
separaten Stelle gespeichert, die nur der Browser sehen kann. Spiele erscheinen
auf der Seite [Spiele laden](/games). Ein Klick auf das Papierkorb-Symbol auf
dieser Seite löscht die Datei **NICHT** von deinem Computer, sondern lässt den
Browser dieses Spiel vergessen.

Die einzige Möglichkeit, die Datei mit den Daten auf deinem Computer zu
aktualisieren, besteht darin, sie mit einer der obigen Methoden erneut zu öffnen.

## Eine config.json importieren

Einstellungen, die du im [Konfigurationsfenster](?config=true) geändert hast,
kannst du im Bereich Daten als `config.json` speichern. Um eine solche Datei
anderswo anzuwenden, ziehe sie auf die App oder die Website oder füge ihren
Inhalt in das Feld Importieren im Bereich Daten ein. Die importierten
Einstellungen ersetzen deine aktuellen eigenen Einstellungen. Eine abgelegte
JSON-Datei wird als Konfiguration behandelt, wenn sie nur Konfigurationswerte
enthält, andernfalls wird sie als Spiel geladen.

## Die Spielinfo bearbeiten

Auf den Bearbeitungsseiten eines Spiels öffnet die Schaltfläche Bearbeiten in
der Werkzeugleiste (oder die Taste `e`) neben der Seite ein Panel mit einem
Formular für die Spielinfo, die Links und die Markierungen Prototyp und in
Arbeit. Die Seite bleibt sichtbar und folgt deinen Eingaben. Das Formular wird
aus dem [Schema der Spieldatei](/docs/games/schemas) erzeugt, daher erscheint
ein neues Feld in diesen Teilen des Schemas im Panel, ohne dass die App
geändert werden muss. Feldnamen und Beschreibungen stammen aus dem Schema und
sind nur auf Englisch. Ein Feld wird übernommen, wenn du es verlässt oder die
Eingabetaste drückst, und ein geleertes Feld wird aus dem Spiel entfernt (der
Titel kann nicht entfernt werden). Probleme mit einem Wert, etwa eine Währung
ohne `#`, werden unter dem Feld angezeigt. Escape schließt das Panel (zum JSON-Editor siehe unten).

Über dem Formular steht ein Suchfeld, um ein Feld des geöffneten Bereichs über seinen Namen zu finden (`/` setzt den Fokus darauf). Die Eingabetaste springt zum nächsten Treffer, öffnet die Karte, in der er liegt, scrollt zum Feld und markiert es, wobei der Fokus im Suchfeld bleibt und die Eingabetaste zum nächsten Treffer weitergeht; Umschalt+Eingabetaste geht zurück, Alt+Eingabetaste setzt den Fokus auf das Feld des aktuellen Treffers und Escape leert den Text. Die Suche schaut nicht in den geschlossenen Bereich „Weitere Felder“ einer Karte. In den Tabs Züge, Privatgesellschaften und Gesellschaften grenzt ein Filterfeld über den Karten diese auf die ein, deren Name, Kürzel, Titel oder Notiz den eingegebenen Text enthält. Das Filtern blendet Karten nur aus und ändert das Spiel nicht; Hinzufügen eines Eintrags leert den Filter.

Das Panel hat für jeden Teil des Spiels, den es bearbeitet, einen Bereich, als Chips unter den Gruppen „Spiel“, „Ausstattung“ und „Aussehen und Ausgabe“. Der Schalter Formulare | JSON in der Kopfzeile wechselt zwischen diesen Formularen und dem JSON-Editor (unten); Formulare führt zurück zum zuletzt geöffneten Formular. Mit `[` und `]` wechselst du zwischen den Formularbereichen (aus dem JSON-Editor gehen sie zum letzten Formular; die Zifferntasten wechseln zu einem anderen Abschnitt des Spiels und
lassen das Panel geöffnet). Ein roter Punkt auf einem Chip markiert einen
Bereich mit Problemen; sein Label nennt die Anzahl. Änderungen bleiben im
Speicher, bis du sie über die Schaltfläche Änderungen prüfen und speichern unter
dem Formular speicherst. Der Tab Züge hat für jeden Zug des Spiels eine Karte, die
aus demselben Schema erzeugt wird. Füge mit Zug hinzufügen einen Zug hinzu und
verschiebe ihn mit den Schaltflächen einer Karte nach oben oder unten,
dupliziere oder entferne ihn. Ein entfernter Zug lässt sich direkt danach mit
Rückgängig zurückholen. Die selten benötigten Felder eines Zugs stehen unter
Weitere Felder. Ein Feld, das das Schema als veraltet markiert, bleibt
bearbeitbar und wird mit einer Warnung angezeigt.

Der Tab Privatgesellschaften funktioniert genauso für die Privatgesellschaften
des Spiels. Eine Karte zeigt zuerst Name, Preis, Einkommen, und Gesellschaft. Das Einkommen ist eine Zahl oder eine Liste, so geschrieben,
wie sie gedruckt wird, etwa `10/20`; Text, der keine Zahlen enthält, etwa
`$10/$20`, bleibt Text. Die übrigen Felder, etwa Notiz und Beschreibung, stehen unter Weitere Felder.

Der Tab Gesellschaften funktioniert genauso für die Gesellschaften des Spiels.
Weil eine Gesellschaft viele Felder hat, ist ihre Karte zunächst eingeklappt und
zeigt Farbe, Name und Kürzel; klicke auf den Titel, um sie zu öffnen. Eine
eingeklappte Karte zeigt ein Warnzeichen, wenn etwas darin ein Problem hat. Name,
Kürzel, Farbe und die Markierung „minor“ stehen zuerst, die übrigen Felder, etwa
Logo und Text der Charter, unter Weitere Felder. Anteile, Marker, Züge, Kredite
und ähnliche Felder werden als JSON bearbeitet. Eine Gesellschaft braucht einen
Namen und ein Kürzel, die sich nicht leeren lassen. Eine neue Gesellschaft
bekommt ein freies Kürzel, und eine Kopie das Kürzel ihrer Vorlage mit einer
Zahl (aus PRR wird PRR2). Andere Teile des Spiels, etwa der Markt, verweisen über
das Kürzel auf eine Gesellschaft: Das Panel aktualisiert diese Verweise nicht,
wenn du eines umbenennst.

Der Tab Phasen funktioniert genauso für die Phasen des Spiels. Eine Karte zeigt
zuerst Name, Limit, Plättchen, Zug, die Markierung „minor“ und Runden. Die
Gesellschaft, das Ereignis, bei dem die Phase beginnt, die Notizen, der Kauf von
Gesellschaften und die Ereignisse stehen unter Weitere Felder. Das Limit ist
eine ganze Zahl, `∞` oder ein Bruch wie `3/4`. Zug und Notizen sind Text oder
eine Liste, wenn du einen Eintrag pro Zeile schreibst (eine einzelne Zeile wird
als einfacher Text gespeichert). Eine Phase braucht ein Limit und Plättchen, die
sich nicht leeren lassen, und einen Namen oder einen Zug. Hat eine Phase
keines von beiden, zeigt das Feld die Meldung des Schemas, dass eine von
mehreren Optionen passen muss. In einem Spiel, dessen Phasen keinen Namen haben,
bekommt eine neue Phase statt eines Namens einen Zug. Das Ereignis, bei dem eine
Phase beginnt (`on`), wird als JSON bearbeitet, also schreibe einen Zugnamen mit
Anführungszeichen, etwa `"3"`. Über Namen verweisen andere Teile des Spiels auf
eine Phase oder einen Zug: Das Panel aktualisiert diese Verweise nicht, wenn du
einen umbenennst.

Der Tab Markt bearbeitet den Aktienmarkt: den Typ (2D, 1D oder 1Diag), ein
Raster der Zellen, die Zellstandards, die Legende und die Bewegung. Klicke auf
eine Zelle oder bewege dich mit den Pfeiltasten, um sie im Formular unter dem
Raster zu bearbeiten: Wert, Beschriftung, Farbe, Legendeneintrag, Par-Markierung,
Pfeile und mehr. Entf leert eine Zelle, und eine Zifferntaste springt zu ihrem
Wert. Die Schaltflächen über dem Raster fügen die Zeile oder Spalte der
gewählten Zelle hinzu, verschieben, duplizieren oder entfernen sie; eine
entfernte Zeile oder Spalte lässt sich mit Rückgängig zurückholen. Ein Markt ist
oft ein Dreieck, deshalb können Zeilen unterschiedlich lang sein und werden nie
aufgefüllt. Ein 1Diag-Markt wird in zwei Reihen gezeichnet, eine Spalte besteht
aus zwei Zellen. Eine Zelle, die nur einen Wert oder nur eine Beschriftung hat,
wird als diese Zahl oder dieser Text gespeichert und wird zu einem Objekt, wenn
du ein zweites Feld setzt. Beim Wechsel des Typs zu 1D oder 1Diag bleibt nur die
erste Zeile erhalten, mit Rückgängig. Legendeneinträge werden über ihre Nummer
verwendet: Beim Verschieben oder Entfernen eines Eintrags siehst du, wie viele
Zellen jetzt auf einen anderen Eintrag zeigen, ihre Nummern werden nicht
geändert. Anzeige, Ledges, Limits und Titel sind unter Erweitert JSON-Felder.

Der Tab Spieler bearbeitet die Bank, das Kapital und das Zertifikatslimit des
Spiels, den Prozentsatz, der von einer Gesellschaft verkauft sein muss, damit
sie gestartet wird, und die Spielertabelle: eine Karte für jede Spielerzahl,
mit einem Titel wie „3 Spieler“, zunächst mit Nummer, Kapital und
Zertifikatslimit und der Bank unter Weitere Felder. Bank, Kapital und
Zertifikatslimit sind eine Zahl oder Text: Eine Zahl wird als Zahl
gespeichert, Text wie `∞` oder `3/4` bleibt Text. Spieler hinzufügen vergibt die
nächste Nummer, und auch eine Kopie bekommt die nächste freie Nummer. Ein
Spieler braucht eine Nummer, die sich nicht leeren lässt. Die Nummern werden
weder sortiert noch auf Wiederholungen geprüft: Die Problemprüfung meldet, was
das Schema nicht erlaubt.

Der Tab Runden bearbeitet die Runden des Rundenzählers (eine Karte für jedes
Rundenplättchen, zunächst mit Name und Farbe und den anderen Feldern unter
Weitere Felder), die auf dem Charter gedruckten Züge (ein Name, seine Schritte,
ob die Schritte nummeriert sind, und die optionalen Schritte) und die Farben
der Nummernkarten.

Der Tab „Token“ bearbeitet die Token des Token-Bogens, die Token-Typen und die
Aktientypen. Ein Token ist eine Zeile mit Text oder einer Zahl (das Label eines
weißen Tokens) oder, mit „Token mit Optionen hinzufügen“, eine Karte, zunächst
mit Label, Icon, Logo und Farbe und den anderen Tokenfeldern unter „Weitere
Felder“. Ein Token-Typ listet die Tokenfelder eines Charters auf dieselbe Weise
(Kosten und ob die Gesellschaft mit einem Token darin startet), ein Aktientyp
seine Aktien (zunächst Anzahl, Label, Prozent und Kosten). Benennst du einen
Typ um oder entfernst ihn, warnt der Editor, wie viele Gesellschaften ihn
noch unter dem alten Namen verwenden.

Der Token einer Gesellschaft und einer Privatgesellschaft (unter Weitere Felder)
und jeder Token im Tab „Token“ hat eine Schaltfläche Token bearbeiten, die den
Token-Editor in einem Dialog öffnet. Eine Vorschau zeigt den Token, wie er
gedruckt wird, auf hellem oder dunklem Hintergrund, und jede Änderung geht
sofort in das Spiel: Es gibt nichts zu speichern, und Zurücksetzen stellt den
Token so wieder her, wie er beim Öffnen des Dialogs war. Form, Inhalt (Logo,
Symbol und Beschriftung), Farben und Verzierungen (ein Balken, Streifen, ein
Schild, Hälften und so weiter, jeweils mit eigenen Optionen) sind gruppiert,
alle anderen Eigenschaften stehen unter Erweitert. Eine Form, die eine Farbe
nimmt, ist eine Farbe oder true (weiß), und eine mit mehreren Farben, etwa
Hälften, hat für jede Farbe ein Feld. Ein Token in der Liste der Token, der nur
eine Beschriftung hat, bleibt Text oder eine Zahl. Was der Editor nicht kennt,
bleibt im Token erhalten.

Der Tab „Farben“ bearbeitet die benannten Farben des Spiels. Jede Farbe hat
eine Farbfläche, die die Farbauswahl öffnet, und ein Textfeld für eine
beliebige CSS-Farbe oder den Namen einer anderen Farbe; „Farbe hinzufügen“
fügt eine hinzu, im Namensfeld benennst du sie um oder entfernst sie. Eine
Farbe, die je nach Phase abweicht, ist ein Objekt und bleibt JSON.

Der Tab „Ausgabe“ bearbeitet den Bereich der Ertragstabelle (den ersten und
letzten Ertrag und wie viele in einer Zeile stehen), die Export-Voreinstellungen
des Spiels (die Dateien, die Seiten, die Layouts, den Hintergrund, die Variante
und die Optionen für PNG, Karten und Board18). Die veraltete Exportoption paginated wird nicht angezeigt und
bleibt in der Datei.

Den Tab „Karte“ gibt es nur auf der Kartenseite und bearbeitet alles an der
gewählten Kartenvariante (`?variation=`) außer ihren Kartenfeldern: den Namen,
welche Variante sie kopiert (bei einer Liste von Varianten; die kopierten
Kartenfelder lassen sich per Koordinate entfernen, eine pro Zeile), ob der Titel
ausgeblendet wird, die abgeschnittenen Kanten, den Rundenzähler, die Bewegung,
die Positionen von Markt und Spielern sowie die Grenzen, Linien und Grenztexte,
jeweils eine Karte mit den Koordinaten, eine pro Zeile. Grenzen, Linien,
Grenztexte und Zuschnitt einer kopierten Variante sind die der kopierten
Variante plus ihre eigenen. Die Kartenfelder selbst gehören zum Hex-Tab.

Der Hex-Tab gibt es nur auf der Kartenseite. Klicke auf ein Kartenfeld auf der
Karte, um seine Gruppe zu wählen, den Eintrag von `map.hexes`, der es auflistet:
Der Tab zeigt dann nur diese Gruppe, standardmäßig als Formular und mit dem
Schalter Formular/JSON als JSON, und die Kartenfelder der Gruppe sind auf der
Karte umrandet. Das Formular zeichnet das Kartenfeld wie die Karte, mit einer
Schaltfläche an jeder Kante: Klicke auf zwei Kanten, um das Gleis dazwischen zu
zeichnen, wähle ein Element aus der Liste oder der Zeichnung, um seine
Eigenschaften zu bearbeiten, und füge Elemente hinzu, kopiere, verschiebe oder
entferne sie. Ziehe eine Stadt, einen Ort, ein Label oder ein anderes Element, um es zu verschieben (sein `x` und `y`), und mache Änderungen mit den Schaltflächen oder Strg bzw. Cmd+Z und Strg bzw. Cmd+Umschalt+Z rückgängig oder wiederhole sie; ein Ziehen ist ein Schritt, und der Verlauf beginnt für jedes Feld neu. Das Formular schreibt nur, was du änderst. Die JSON-Ansicht lässt
sich nicht verlassen, solange ihr Text ungültig ist. Ein Hinweis zeigt an, wenn
eine Änderung für mehrere Kartenfelder der Gruppe gilt oder wenn eine andere
Gruppe das Kartenfeld ebenfalls auflistet. Auch leere Positionen lassen sich wählen, ebenso die Reihe und die
Spalte direkt hinter der Karte. Die Seite folgt dem Text, solange er eine
gültige Gruppe ist, ein Objekt mit einer Liste `hexes` aus mindestens einer
Koordinate wie `B2`; alles andere bleibt ein Entwurf, und das Spiel behält seine
letzte gültige Version. Halte Cmd (Strg unter Windows und Linux) gedrückt und
klicke auf ein anderes Kartenfeld, um es in die Gruppe zu verschieben, aus der
Gruppe, in der es war, oder klicke auf ein Kartenfeld der Gruppe, um es zu
entfernen. Eine Gruppe ohne Kartenfeld wird entfernt, und das letzte Kartenfeld
der Karte bleibt. Die Gruppe einer leeren Position wird zum Spiel hinzugefügt,
sobald du sie zum ersten Mal änderst. Mit Escape lässt du die Gruppe los. Die
Adresse behält sie als `hex`, die erste Koordinate der Gruppe
(`?edit=true&editSection=hex&hex=C11`). Das Wählen von Kartenfeldern funktioniert
auf der Karte mit Schwenken und Zoomen am Bildschirm, solange das Panel offen
ist; die gedruckten und exportierten Karten ändern sich nicht. Eine Kartenvariante,
die eine andere kopiert, zeigt die kopierten Kartenfelder an: Ändere
sie in der Variante, aus der sie stammen, oder drücke _Hier überschreiben_, um
das Kartenfeld in dieser Variante zu kopieren und die Kopie zu bearbeiten. Die Kantenschaltflächen und die Listen des
Formulars lassen sich per Tastatur bedienen.

Der Tab Konfiguration bearbeitet die `config` des Spiels als JSON, die
Einstellungen, die für dieses Spiel gelten, wenn im [Konfigurationsfenster](/docs/config)
_Spiel-Konfiguration erlauben_ aktiv ist. Sie ist ein Objekt wie
`{ "fonts": { "roles": { "title": { "style": "italic" } } } }`. Die Seite folgt
dem Text, solange er ein JSON-Objekt ist; alles andere bleibt ein Entwurf. Ein
Wert, den das [Konfigurationsschema](/docs/games/schemas) nicht erlaubt (eine
`size` der Schrift von `"big"`), wird im Text markiert und setzt einen roten
Punkt auf den Tab. Ein leeres Objekt entfernt `config` aus dem Spiel.

Die Änderungen bleiben im geladenen Spiel. Prüfe und speichere sie auf der
Seite Änderungen, die im Folgenden beschrieben wird.

### JSON-Editor

Der JSON-Editor bearbeitet das ganze Spiel als JSON (derselbe Text, den die
Schaltfläche Herunterladen schreibt, ohne die Meta-Daten). Mit `j` öffnest du auf
jeder Seite, solange ein Spiel geladen ist, das Panel im JSON-Editor, wechselst
dorthin oder schließt, außerhalb des Editors, das Panel. Die Teile des Spiels
außer `info` sind zunächst eingeklappt. Die Seite folgt deiner Eingabe kurz nachdem du aufhörst zu tippen,
aber nur solange der Text ein gültiges JSON-Objekt mit einem `info`-Objekt und
einem `info.title` aus Text ist. Solange das nicht der Fall ist, behält das
Spiel seine letzte gültige Version, und das Problem wird unter dem Editor mit
Zeile und Spalte angezeigt. Die Meldung des Parsers ist nur auf Englisch. Dein
unfertiger Text bleibt beim Wechseln des Tabs oder Schließen des Panels
erhalten, bis du ihn verwirfst oder die Seite neu lädst. Probleme im Spiel
selbst (ein unbekanntes Feld, ein falscher Typ) warnen nur: Sie sind am Rand
markiert und auf der [Problemseite](/docs/games/schemas) aufgelistet, und das
Spiel wird trotzdem aktualisiert.

Formatieren schreibt den Text mit 2 Leerzeichen Einrückung neu. Es ist nur
verfügbar, solange das JSON gültig ist, und warnt vorher, wenn Namen in einem
Objekt doppelt vorkommen oder Zahlen mehr Stellen haben, als gespeichert werden
können, da beides verloren geht. Ein abschließendes Komma oder einfache
Anführungszeichen lassen sich über die Markierung am Rand beheben. Wird das
Spiel anderswo geändert (Zurücksetzen auf der Änderungsseite, Wiederherstellen
aus dem Verlauf), wird der Text aktualisiert. War dein Text in diesem Moment
nicht gültig, bleibt er unverändert, und ein Hinweis sagt, dass sich das Spiel
geändert hat.

Tab rückt im Editor ein. Um ihn zu verlassen, drücke Escape (das erste Escape
verlässt den Editor, ein zweites schließt das Panel) und danach Tab.

#### Editor-Tasten

Die Einstellung Editor-Tasten auf der [Einstellungsseite](/settings) wählt die
Tasten des JSON-Editors: Normal (Standard), Emacs oder Vim. Die Emacs- und
Vim-Tasten werden geladen, wenn du sie wählst, und beim Wechsel der Einstellung
bleiben dein Text und sein Rückgängig-Verlauf erhalten. Die Tasten funktionieren
nur, solange der Editor den Fokus hat. `Mod` ist Cmd unter macOS und Strg unter
Windows und Linux. In Emacs und Vim funktionieren unter macOS auch die normalen
Tasten; auf anderen Systemen gehört Strg dem Modus. Kopieren, Einfügen,
Rückgängig und Alles auswählen behalten in Normal ihre üblichen Tasten. In Vim
verlässt Escape den Editor nur, wenn Vim im Normalmodus ist und kein Befehl
aussteht. Die Suche hat in Emacs und Vim eigene Tasten.

| Aktion                                 | Normal                       | Emacs        | Vim        |
| -------------------------------------- | ---------------------------- | ------------ | ---------- |
| Formatieren                            | `Mod-Shift-f`, `Shift-Alt-f` | `C-c C-f`    | `:format`  |
| Spiel jetzt aus dem Text aktualisieren | `Mod-s`                      | `C-x C-s`    | `:w`       |
| Nächstes Problem                       | `F8`                         | `M-g n`      | `]d`       |
| Vorheriges Problem                     | `Shift-F8`                   | `M-g p`      | `[d`       |
| Suchen                                 | `Mod-f`                      | `C-s`, `C-r` | `/`, `?`   |
| Nächster Treffer                       | `Mod-g`                      |              |            |
| Vorheriger Treffer                     | `Shift-Mod-g`                |              |            |
| Alles ein- oder ausklappen             | `Ctrl-Alt-[`, `Ctrl-Alt-]`   |              | `zM`, `zR` |

### Links zu einem Teil des Editors

Die Adresse der Seite sagt, wo du bist, sodass du sie teilen oder später wieder
öffnen kannst: der Abschnitt (`/games/18Test/tiles`), das geöffnete Panel und
sein Tab (`?edit=true&editSection=json`, `?config=true&section=tokens`) und die
Kartenfilter (`?hidePrivates=true`). Ein Tab- oder Abschnittsname, den es nicht
gibt, öffnet den ersten.

Klicke im JSON-Editor auf eine Zeilennummer, um die Zeile zu markieren.
Umschalt-Klick markiert die Zeilen von der ersten markierten Zeile bis zu der,
die du anklickst, und Cmd-Klick (Strg unter Windows und Linux) fügt eine Zeile
hinzu oder entfernt sie, mit zusätzlicher Umschalttaste fügt es den Bereich
hinzu. Die markierten Zeilen stehen als `lines` in der Adresse, zum Beispiel
`?edit=true&editSection=json&lines=1-4,15,16,19`, und der Editor scrollt beim
Öffnen des Links zur ersten. Das Markieren von Zeilen legt keine Seiten im
Browserverlauf an. Die Zeilen werden vergessen, wenn du den Tab wechselst oder
das Panel schließt.

## Änderungen, Speichern und Verlauf

Weicht das geladene Spiel von seiner Datei ab, erscheint im Spielmenü (und in
der Werkzeugleiste) der Eintrag Änderungen, mit der Anzahl der geänderten Felder
auf oberster Ebene. Er öffnet eine Seite mit einem hervorgehobenen Diff des
Spiels gegenüber der Datei, wie sie geladen oder zuletzt gespeichert wurde. Der
Diff vergleicht das Spiel als JSON mit 2 Leerzeichen, daher werden Unterschiede,
die nur Leerraum betreffen, nicht angezeigt.

Auf der Seite Änderungen schreibt "Speichern" das Spiel in seine Datei, mit
demselben Inhalt wie die Schaltfläche Herunterladen, daher kann das erste
Speichern die Datei neu formatieren. "Auf Gespeichertes zurücksetzen" verwirft
die Änderungen. Speichern funktioniert für Spiele in der App, für Spiele, die in
einem unterstützenden Browser aus deinem Dateisystem geöffnet wurden (der
Browser fragt nach der Schreibberechtigung), und für Spiele im privaten
Dateisystem des Browsers. Mitgelieferte Spiele haben keine Datei und können nicht überschrieben
werden: Nutze „Speichern unter...“, um eine Kopie zu speichern, oder
Herunterladen. Wurde die Datei seit dem Laden außerhalb von 18xx Maker geändert, wird
nichts geschrieben, bis du entscheidest, sie neu zu laden (und deine Änderungen
zu verlieren) oder sie zu überschreiben.

Jedes Speichern der aktuellen Sitzung steht auf der Seite Verlauf: die Datei,
wie sie vor diesem Speichern war. "Diff anzeigen" vergleicht sie mit dem Spiel,
wie es jetzt ist, und "Wiederherstellen" übernimmt sie als deine nicht
gespeicherten Änderungen. Der Verlauf geht verloren, wenn du ein anderes Spiel
lädst oder die Seite neu lädst. Nicht gespeicherte Änderungen bleiben ebenfalls
nicht erhalten: Der Browser fragt nach, bevor die Seite geschlossen oder neu
geladen wird.
