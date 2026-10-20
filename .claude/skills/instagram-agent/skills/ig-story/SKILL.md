---
name: ig-story
description: Plans a daily Instagram story sequence, assigns each sticker a job, and drafts a DM only after the viewer moves first. Use for Stories, Sticker, or a DM funnel. Writes German or English. Does not post or message anyone.
---

# Story

Eine Story-Folge für einen Tag. Jeder Sticker hat eine Aufgabe. Die Nachricht geht erst raus, wenn die andere Person zuerst geantwortet oder kommentiert hat.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des Auftrags, sonst `default_language`.

Zahlen nur aus Stimme oder Auftrag.

Nichts posten, keine DM absenden, keine Liste von Fremden anschreiben.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

Drei bis sieben Karten. Pro Karte: Bild, Text, Sticker, Aufgabe des Stickers.

Sticker-Aufgaben, nicht mehr als eine pro Karte:

- Umfrage sortiert die Zuschauer in zwei Lager, die du beide ernst meinst
- Fragen-Sticker holt eine Antwort in ihren Worten
- Quiz nur, wenn es eine richtige Antwort gibt
- Countdown nur mit einem echten Datum
- Link erst, nachdem die vorige Karte den Grund gezeigt hat
- Slider für eine Stimmung, nicht für eine Verkaufsfrage

Die letzte Karte bittet um ein Wort in der Antwort, wenn ein DM-Trichter gewollt ist. Der DM-Entwurf ist die Antwort auf dieses Wort. Er geht nicht an Leute, die nichts geschickt haben.

Kein "Hör auf zu scrollen". Keine Karte, die nur ein Logo ist.

Humanizer und Detect auf die Kartentexte und den DM-Entwurf:

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" story.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" story.txt --lang de
```

## Ausgabe

- Karten in Reihenfolge
- Das eine Wort, auf das du wartest
- DM-Entwurf, klar als Entwurf markiert
- Human-Score der Texte
- Copy-Block
