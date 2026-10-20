---
name: ig-carousel
description: Drafts an Instagram carousel as a text spec with a cover line, slide copy, and a 4:5 frame. Use for a Karussell, Slides, or swipe post. Writes German or English. Does not render images or post.
---

# Karussell

Ein Karussell ist eine Folge von Sätzen, die man wischen kann. Dieses Skill liefert den Text und das Format. Es erzeugt keine Bilddateien.

Format aus `lib/platform.json`: 4:5, 1080x1350. Wenig Text, großer Gegenstand. Die erste Karte muss ohne die zweite verständlich sein.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des Auftrags, sonst `default_language`.

Zahlen nur aus Stimme oder Auftrag.

Nichts posten. Am Ende ein Copy-Block.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

1. Cover: eine Behauptung, höchstens acht Wörter, ein Gegenstand. Die Behauptung nennt das Ergebnis oder den Preis, nicht das Thema.
2. Vier bis acht Folgekarten. Jede Karte ein Satz. Keine Karte setzt "Teil 2" voraus.
3. Letzte Karte: die eine Handlungsaufforderung aus der Stimme.
4. Pro Karte: Nummer, Text auf der Karte, was im Bild zu sehen ist, was nicht darauf soll.
5. Caption nach `skills/ig-caption/SKILL.md`, inklusive `caption.py`, Humanizer und Detect. Die Caption wiederholt das Cover nicht als Floskel. Sie setzt den Beleg darunter.

## Ausgabe

- Kartenliste
- Caption mit Feed-Fenster und Human-Score
- Copy-Block: Karten, dann Caption
