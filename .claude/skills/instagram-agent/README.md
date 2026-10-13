# Instagram Agent

Ein Claude-Code-Plugin. Es schreibt Entwürfe für Reels, Captions, Karussells, Stories, Kommentare, Antworten, DMs und eine Woche. Hooks, Timing, das Feed-Fenster und Floskeln prüft es lokal, ohne Netzwerk und ohne Zusatzpakete.

Die Texte entstehen auf Deutsch oder Englisch, je nach Auftrag. Die Stimme legt die Standardsprache fest.

Es wird nichts gepostet, nichts abgefragt und nichts gescraped. Am Ende liegt ein Block zum Kopieren.

Anleitung: [Instagram-Skills für Claude](https://thanisch.co/wissen/guides/instagram-skills-claude).

## Installieren

Den Ordner nach `~/.claude/skills/instagram-agent/` legen und in Claude Code `/reload-plugins` ausführen. Ein Ordner mit `.claude-plugin/plugin.json` an dieser Stelle lädt als Plugin.

Prüfen:

```bash
claude plugin validate .
```

Die Befehle heißen `/instagram-agent:ig-reel`, `/instagram-agent:ig-caption` und so weiter. `/instagram-agent:ig` schickt einen offenen Auftrag an den passenden Ablauf.

## Stimme

`templates/voice.md` nach `instagram/voice.md` im Projekt kopieren, oder nach `~/.claude/instagram/voice.md`. Die Skills lesen zuerst die Datei im Projekt.

Dort stehen Sprache, Ton, Beweis und die eine Handlungsaufforderung. Zahlen, die dort nicht stehen, bleiben Platzhalter.

## Abläufe

| Befehl | Aufgabe |
| --- | --- |
| `ig` | Auftrag an den passenden Ablauf |
| `ig-reel` | Drei Hooks, Skript, Bildtext, Beat-Sheet |
| `ig-viral` | Eigene Swipe-Datei nach Account-Median sortieren |
| `ig-caption` | Caption, Feed-Fenster, höchstens fünf Hashtags |
| `ig-carousel` | Karten als Text, Format 4:5 |
| `ig-story` | Story-Folge, Sticker-Aufgabe, DM erst nach einer Antwort |
| `ig-profile` | Profil auf 100, Lücken zuerst |
| `ig-plan` | Eine Woche und zehn konkrete Engagement-Plätze |
| `ig-human` | Unsichtbare Zeichen, Typografie, Floskeln, Score |
| `ig-comment` | Ein Kommentar, neun Typen |
| `ig-reply` | Eigene Kommentare sortiert beantworten |
| `ig-dm` | Keyword-Text, erste Antwort, Collab, zwei Follow-ups |
| `ig-repurpose` | Ein langes Stück in eigenständige Beiträge |
| `ig-audit` | Eigene Insights nach Vielfachem und Sends pro Reach |

## Tools

Nur die Standardbibliothek. Aufruf aus dem Plugin-Root:

```bash
python3 lib/hookscore.py hooks.txt
python3 lib/beats.py script.txt --target 30
python3 lib/caption.py caption.txt --keywords "frist, rechnung"
python3 lib/humanize.py draft.txt --report
python3 lib/detect.py before.txt after.txt
python3 lib/swipe.py captured.tsv
```

`hookscore.py` gewichtet Konkretheit und die ersten Wörter. Einsatz und Ansprache stehen als schwache Signale im Report. Eine Begrüßung, ein "Hör auf zu scrollen" oder ein Videovorspann deckeln den Score. Trifft keine Hook-Formel klar, bleibt das Urteil `abstain`.

`beats.py` rechnet mit 165 Wörtern pro Minute. Es markiert einen Hook über drei Sekunden, einen Beat über vier Sekunden, drei Beats ohne etwas Konkretes und eine letzte Zeile, die nicht zum Hook zurückkehrt.

`caption.py` zeigt die ersten 125 Zeichen. Caption-Limit 2200, Hashtags 5, Mentions 20. Die Zahlen und das Prüfdatum liegen in `lib/platform.json`. Wenn Instagram davon abweicht, gilt Instagram.

`humanize.py` löscht unsichtbare Zeichen, normalisiert Typografie und ersetzt Einträge aus `lib/slop.de.json` und `lib/slop.en.json`. Satzfiguren schreibt es nicht um.

`detect.py` ist eine lokale Heuristik. Sie ist kein Detector-Dienst und behauptet nicht, einen Text unsichtbar zu machen.

`swipe.py` sortiert nach Views geteilt durch den Median des jeweiligen Kontos. Die Datei braucht die Spalten `account`, `baseline`, `views`, `hook`. Optional `sends` und `reach`.

## Tests

```bash
python3 -m unittest discover tests
```

## Grenzen

Kein Login, kein Passwort, kein Crawler, kein Posten, kein Kommentieren und kein DM durch das Plugin. Die Keyword-Antwort ist ein Text für die Funktion, die Instagram selbst dafür hat. Sie setzt voraus, dass jemand zuerst das Wort schreibt.

## Lizenz

MIT. Siehe [LICENSE](LICENSE).
