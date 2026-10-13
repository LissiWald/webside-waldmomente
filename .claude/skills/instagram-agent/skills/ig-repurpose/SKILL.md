---
name: ig-repurpose
description: Turns one video, podcast, or newsletter into a week of Reels and carousels that each stand alone. Use for Repurpose, one long piece into posts, or a newsletter cut into Reels. Writes German or English. Does not post.
---

# Aus einem Stück eine Woche

Ein langes Stück, das der Nutzer einfügt: Transkript, Newsletter, Skript. Daraus eine Woche von Beiträgen. Jeder Beitrag ist ohne die anderen verständlich. Kein "Teil 2", kein "wie ich eben sagte".

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache der Quelle, außer der Auftrag bittet um die andere.

Keine Stelle erfinden, die in der Quelle nicht vorkommt. Eine Zahl, die in der Quelle fehlt, bleibt ein Platzhalter.

Nichts posten.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

1. Ziehe vier bis sechs eigenständige Momente aus der Quelle. Ein Moment ist ein Gegenstand, eine Zahl oder ein Satz, den man filmen oder auf eine Karte schreiben kann.
2. Drei bis vier davon werden Reels, ein bis zwei werden Karussells. Nicht alles zum Reel machen, wenn ein Moment eine Liste ist.
3. Für jedes Reel: ein Hook, dann `hookscore.py`. Dealbreaker verwerfen. Danach ein Kurzskript mit einer Zeile pro Beat und `beats.py` mit Ziel 20 bis 30 Sekunden. Die letzte Zeile kommt auf den Hook zurück.
4. Für jedes Karussell: Cover plus Karten, wie in `skills/ig-carousel/SKILL.md`, ohne Bilddateien.
5. Pro Beitrag eine Caption-Erste-Zeile. `caption.py` auf die Captions, die der Nutzer sofort haben will. Sonst nur die erste Zeile und den einen Ask.
6. Humanizer über alle gesprochenen Zeilen und Captions.

Dieselbe Formel aus `lib/hooks.json` höchstens zweimal in der Woche.

## Ausgabe

- Die Momente, mit der Stelle in der Quelle
- Pro Beitrag Format, Hook mit Score, Skript oder Karten
- Human-Score der Texte
- Copy-Block je Beitrag
