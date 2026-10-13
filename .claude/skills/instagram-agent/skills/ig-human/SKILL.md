---
name: ig-human
description: Cleans a draft of invisible characters, odd typography, and stock phrases, then scores what remains. Use for humanize, Floskeln, AI-Ton, or em dashes. Writes German or English. Does not claim a text is undetectable.
---

# Humanizer

Zwei lokale Prüfungen. Sie rufen keinen Detector auf. Sie versprechen kein "undetectable".

`humanize.py` entfernt unsichtbare Zeichen, setzt Gedankenstriche, geschweifte Anführungen und Auslassungspunkte in normale Zeichen, und ersetzt Einträge aus `lib/slop.de.json` oder `lib/slop.en.json`.

`detect.py` bewertet fünf Dinge: Satzrhythmus, Konkretheit, Floskel-Dichte, Typografie-Fingerabdruck, strukturelle Muster. Muster wie "nicht nur X, sondern Y", Dreierlisten, Emoji-Aufzählungen, gleich lange Sätze und Hashtag-Wände werden markiert und nicht automatisch umgeschrieben.

## Schranken

Sprache des Entwurfs. `--lang de` oder `--lang en`, wenn sie klar ist, sonst `auto`.

Die Stimme in `instagram/voice.md` oder `~/.claude/instagram/voice.md` sagt, welche Wörter bleiben, auch wenn sie im Lexikon stehen. Diese Wörter nach dem Lauf wieder einsetzen und das sagen.

Nichts posten.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" draft.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" before.txt after.txt --lang de
```

Zeig jede Änderung. Schreibe die markierten Muster einmal um. Zahlen, Namen und die eine Handlungsaufforderung bleiben. Danach Detect erneut. Den Score nicht schönen.

Unter 70 ist `FLAGGED`. Sag das so.

## Ausgabe

- Änderungsliste
- Die beiden Scores und das Delta
- Die übrig gebliebenen Tells, jeweils mit dem umgeschriebenen Satz
- Copy-Block: der bereinigte Text
