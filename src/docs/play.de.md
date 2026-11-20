# Online-Spiel

18xx Maker kann das Spiel, das du geöffnet hast, auf einen Spielserver legen. So
kannst du mit deinen Freunden von verschiedenen Computern aus Plättchen, Token
und Marktmarker auf einem gemeinsamen Spielbrett bewegen. Jeder Zug erscheint
nach einem Moment bei allen am Spielbrett.

Für das Online-Spiel brauchst du einen Spielserver. Jemand betreibt einen (siehe
[Einen Spielserver betreiben](/docs/play-server)) und gibt dir seine Adresse.

## Was das Online-Spiel ist

Das Online-Spiel ist ein gemeinsamer Tisch, keine Spiel-Engine. Es kennt die
Regeln des Spiels nicht:

- Nichts wird durchgesetzt. Alle können jedes Plättchen auf jedes Kartenfeld
  legen, jeden Token und jeden Marker bewegen und alles aus der Bank nehmen.
- Es gibt keine Zugreihenfolge. Alle können jederzeit ziehen.
- Die Ablagen (was jeder Spieler und die Bank besitzen) sind gemeinsam. Nur das
  zu nehmen, was dir gehört, beruht auf Ehrlichkeit.
- Alle im Spiel können jeden Zug rückgängig machen, ihren eigenen oder den eines
  anderen.
- Das Protokoll ist dauerhaft. Jeder Zug, jedes Rückgängigmachen und jede
  Änderung der Notizen bleibt im Verlauf des Spiels. Rückgängig hebt einen Zug
  nur auf, es löscht ihn nicht.

Spiel es wie an einem echten Tisch: Einigt euch in eurem Chat auf die Regeln und
darauf, wer als Nächstes zieht.

## Den Spielserver eintragen

Öffne die [Einstellungen](/settings) in der Seitenleiste und trage unter
**Spielserver** die Adresse des Servers ein, zum Beispiel
`https://play.example.com`. Lass das Feld leer, um das Online-Spiel
auszuschalten. Die Website erreicht jeden Server mit `https://`; eine einfache
`http://`-Adresse funktioniert nur für einen Server auf deinem eigenen Computer
(`localhost`).

## Anmelden

Öffne **Spielen** in der Seitenleiste und wähle **Mit Discord anmelden**.
Discord fragt, ob der Spielserver deinen Namen und deine Server sehen darf, und
schickt dich dann zurück zu 18xx Maker. Alle Spieler brauchen ein Discord-Konto,
auch um einem Spiel beizutreten.

Eine Anmeldung gilt so lange, wie der Server es erlaubt (30 Tage, wenn der
Server nichts anderes festlegt). Danach zeigt das Spielbrett, dass deine
Anmeldung abgelaufen ist: Melde dich erneut an. **Abmelden** auf der Seite
Spielen beendet die Anmeldung in diesem Browser.

## Ein Spiel erstellen

Lade zuerst das Spiel, das du spielen möchtest (über [Spiele laden](/games) oder
indem du eine Datei öffnest), geh dann zu **Spielen** und nutze **Spiel
erstellen**. Gib den Namen ein, den die anderen Spieler sehen, und wähle **Spiel
erstellen**.

Die Spieldatei, deine Konfiguration und die eigenen Bilder des Spiels (siehe
[Eigene Bilder](/docs/games/images)) werden auf den Server hochgeladen, die
anderen Spieler brauchen die Datei also nicht. Spätere Änderungen an der Datei
ändern das Online-Spiel nicht: Erstelle für eine neue Version ein neues Spiel.

Der Server hat Grenzen:

- Jedes Bild darf höchstens 1 MB groß sein. Ein größeres Bild wird genannt,
  bevor etwas hochgeladen wird, und es wird kein Spiel erstellt.
- Der Server begrenzt auch die Größe der Spieldatei, die Zahl der Bilder und
  ihre Gesamtgröße sowie die Zahl der Spiele, die du besitzen darfst. Die
  Standardwerte sind 2 MiB, 50 Bilder, 8 MiB und 50 Spiele, aber der Betreiber
  des Servers kann sie ändern.
- Der Server prüft die Spieldatei. Eine Datei mit Fehlern wird abgelehnt und die
  Fehler werden aufgelistet: Behebe sie (siehe
  [JSON-Schemas](/docs/games/schemas)) und versuche es erneut.
- Ein Server kann das Erstellen von Spielen auf die Mitglieder eines
  Discord-Servers beschränken. Wenn du keine Spiele erstellen darfst, kannst du
  trotzdem mit einem Einladungslink beitreten.

## Spieler einladen

Wenn das Spiel erstellt ist, bist du sein Besitzer. Nutze **Einladungslink
kopieren** im Menü des Besitzers auf dem Spielbrett und schick den Link an die
anderen Spieler. Der Link zeigt den Titel des Spiels; ein Spieler meldet sich
an, gibt einen Namen ein, wählt eine Farbe und dann **Spiel beitreten**. **Deine
Spiele** auf der Seite Spielen listet jedes Spiel, in dem du einen Platz hast.

Alle mit dem Einladungslink können beitreten, solange das Spiel aktiv ist, also
teile ihn nur mit deinen Mitspielern. **Neuer Einladungslink** erzeugt einen
neuen, und der alte Link funktioniert nicht mehr; wer schon beigetreten ist,
behält seinen Platz.

## Das Spielbrett

Das Spielbrett zeigt auf einer Seite die Karte (oder den Markt) und auf der
anderen die Werkzeuge in Reitern. Das Abzeichen neben dem Titel zeigt, ob du
online bist. Bricht die Verbindung ab, verbindet sich das Spielbrett von selbst
neu und holt die verpassten Züge nach.

### Plättchen

Wähle ein Plättchen, dreh es mit **Nach links drehen** und **Nach rechts
drehen** und klicke dann auf ein Kartenfeld, um es zu legen. Klicke auf ein
Kartenfeld, um es auszuwählen, und dreh oder entferne dann sein Plättchen. Jedes
Plättchen zeigt, wie viele übrig sind. Sind keine mehr übrig, steht das am
Plättchen, und wenn du es trotzdem legst, gehst du über den Vorrat hinaus (das
Spielbrett warnt dich, hält dich aber nicht auf).

### Token

Wähle eine Gesellschaft und klicke dann auf eine Stelle eines Kartenfelds, um
ihren Token zu legen. Die Liste zeigt, wie viele Token jeder Gesellschaft
liegen, und warnt, wenn eine Gesellschaft keine mehr übrig hat. Klicke auf einen
Token, um ihn auszuwählen und zu entfernen.

### Markt

Wähle eine Gesellschaft und klicke dann auf eine Zelle des Aktienmarkts, um
ihren Marker dorthin zu ziehen.

### Ablagen

Jeder Spieler hat eine Ablage, die Bank auch. Ablagen enthalten Gesellschaften
und Plättchen. Neue Dinge kommen aus der Bank: Nutze **Aus der Bank hinzufügen**
an einer Ablage und verschiebe ein Ding mit dem Menü **Verschieben** neben dem
Ding von einer Ablage in eine andere.

### Notizen

Die Notizen sind ein Text, den alle im Spiel sehen, für Geld, Aktienzahlen oder
alles andere, was das Spielbrett nicht verfolgt. Sie werden gespeichert, wenn du
das Feld verlässt, und dürfen höchstens 10.000 Zeichen haben.

### Verlauf und Rückgängig

Der Reiter **Verlauf** listet jeden Zug, den neuesten zuerst, mit dem, der ihn
gemacht hat. **Rückgängig** hebt den neuesten Zug auf, der noch gilt, egal von
wem, und der Verlauf streicht ihn durch. Rückgängig ist selbst ein Zug: Drückst
du direkt nach einem Rückgängig noch einmal **Rückgängig**, kommt der Zug
zurück.

### Wer online ist

Die Initialen neben dem Titel sind die Spieler, die gerade am Spielbrett sind,
in ihren Farben. Zeig auf eine, um den Namen zu sehen.

## Steuerung für den Besitzer

Der Besitzer eines Spiels hat auf dem Spielbrett das Menü des Besitzers:

| Eintrag                    | Was er tut                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Einladungslink kopieren    | Kopiert den Einladungslink.                                                                                                             |
| Neuer Einladungslink       | Erzeugt einen neuen Einladungslink. Der alte funktioniert nicht mehr.                                                                   |
| Zuschauerlink              | Erzeugt und kopiert den Zuschauerlink (siehe unten).                                                                                    |
| Discord-Benachrichtigungen | Schickt die Züge des Spiels in einen Discord-Kanal (siehe unten).                                                                       |
| Spiel sperren              | Macht das Spiel schreibgeschützt: Niemand kann ziehen und niemand Neues beitreten. Für eine Pause oder wenn das Spiel vorbei ist.       |
| Spiel entsperren           | Öffnet ein gesperrtes Spiel wieder.                                                                                                     |
| Spiel archivieren          | Legt das Spiel beiseite. Es ist schreibgeschützt und zählt nicht zu der Zahl der Spiele, die du besitzen darfst.                        |
| Spiel wieder öffnen        | Macht ein archiviertes Spiel wieder aktiv. Es zählt dann wieder zu deinen Spielen.                                                      |
| Spiel löschen              | Löscht das Spiel für alle, mit allen Zügen und Notizen. Das kann nicht rückgängig gemacht werden, und das Spielbrett fragt vorher nach. |

## Zuschauerlink

Mit einem Zuschauerlink können Leute einem Spiel ohne Anmeldung zuschauen, zum
Beispiel bei einem Stream oder Freunde, die nicht mitspielen. Zuschauer sehen
das Spielbrett und jeden Zug, sobald er passiert, können aber nichts ändern und
werden nicht bei den Spielern angezeigt.

Wähle **Zuschauerlink** im Menü des Besitzers, um den Link zu erzeugen und zu
kopieren. **Neuer Zuschauerlink** ersetzt ihn, und **Zuschauerlink beenden**
schaltet ihn aus. Beides beendet den alten Link sofort, auch für alle, die
gerade damit zuschauen. Gesperrte und archivierte Spiele kann man weiter
ansehen. Ein Server erlaubt nur eine begrenzte Zahl von Zuschauern pro Spiel
(standardmäßig 50); darüber hinaus bittet die Seite, es später erneut zu
versuchen.

Behandle den Link wie den Einladungslink: Alle, die ihn haben, können zuschauen.

## Discord-Benachrichtigungen

Der Besitzer kann die Züge eines Spiels in einen Discord-Kanal posten lassen:

1. Öffne in Discord die Einstellungen des Kanals, dann **Integrationen**,
   **Webhooks**, **Neuer Webhook**, und wähle **Webhook-URL kopieren**.
2. Öffne auf dem Spielbrett **Discord-Benachrichtigungen** im Menü des
   Besitzers, füge die URL ein und wähle **Speichern**. Der Kanal bekommt
   „Notifications connected“.

Ab dann wird jeder Zug zu einer Zeile, etwa „Alice placed tile 7 on A1“ (die
Nachrichten sind auf Englisch). Die Zeilen werden ein paar Sekunden gesammelt
und zusammen gepostet, ein belebter Kanal bekommt also wenige Nachrichten statt
vieler. Eine Änderung der Notizen wird als „Alice updated the notes“ gepostet,
nie mit ihrem Text. Niemand wird erwähnt.

Die URL bleibt auf dem Server und wird nie wieder angezeigt, auch nicht dem
Besitzer. Um die Benachrichtigungen auszuschalten, öffne
**Discord-Benachrichtigungen** und wähle **Entfernen**. Auch wenn du den Webhook
in Discord löschst, hören sie auf.

## Desktop-App

Das Online-Spiel gibt es nur auf der Website. Die [Desktop-App](/docs/app) zeigt
die Seite Spielen mit dem Hinweis, die Website zu nutzen.

## Bekannte Grenzen

- Die anderen Spieler sehen ein Sperren oder Entsperren nicht sofort. Nach dem
  Sperren wird ihr nächster Zug abgelehnt und ihr Spielbrett wird
  schreibgeschützt; nach dem Entsperren sehen sie das Spiel erst wieder offen,
  wenn sie die Seite neu laden.
- Das Spielbrett prüft nichts am Spiel (siehe
  [Was das Online-Spiel ist](#was-das-online-spiel-ist)).
- Ein Spiel ist eine Kopie der Spieldatei zum Zeitpunkt der Erstellung.
  Änderungen an der Datei brauchen ein neues Spiel.
