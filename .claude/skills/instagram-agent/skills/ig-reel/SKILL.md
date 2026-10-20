---
name: ig-reel
description: Turns one idea into an Instagram Reel with three scored hooks, a spoken script, on-screen text, and a timed beat sheet. Use for a Reel, Skript, Hook, or Beat-Sheet. Writes German or English. Does not post.
---

# Reel

Eine Idee wird zu einem Reel, das man sprechen kann. Drei Hooks, einer bleibt, dann Skript, Bildtext und Timing.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`. Fehlt die Datei, sag das. Erfinde keine Stimme.

Sprache des Auftrags, sonst `default_language`.

Zahlen und Ergebnisse nur aus Stimme oder Auftrag. Sonst `{{deine Zahl}}` oder `{{your number}}`.

Nichts posten. Am Ende ein Copy-Block.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

1. Lies `lib/hooks.json`. Wähle drei verschiedene Formel-IDs, die zur Idee passen. Schreibe je einen gesprochenen Hook in der Zielsprache. Nicht die Beispielsätze aus der Datei abschreiben.
2. Speichere die drei Hooks als Textdatei, eine Zeile pro Hook, und führe aus:

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/hookscore.py" hooks.txt --lang de
```

`de` oder `en`.

3. Nimm den stärksten Hook ohne Dealbreaker. Spezifität und die ersten Wörter entscheiden. `stakes` und `address` sind schwache Signale und wählen keinen Sieger zwischen zwei brauchbaren Hooks. Liegen alle unter OK, einmal neu schreiben und erneut scoren. Einen schwachen Hook nicht als stark ausgeben.
4. Schreibe das Skript. Eine Zeile ist ein Beat. Die erste Zeile ist der gewählte Hook. Die letzte Zeile kommt auf ein konkretes Wort aus der ersten zurück. Zwischen zwei Beats wechselt das Bild.
5. Timing:

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/beats.py" script.txt --target 30 --lang de
```

Ziel aus der Stimme, sonst 30 Sekunden. Behebe die Flags: Hook über 3 Sekunden, Beat über 4 Sekunden, drei Beats ohne Zahl, Name oder Gegenstand, fehlende Rückkehr zum Hook.
6. Bildtext pro Beat: wenige Wörter, derselbe Gegenstand wie der gesprochene Satz.
7. Humanizer und Detect auf das gesprochene Skript. Markierte Satzmuster einmal umschreiben und erneut prüfen.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" script.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" script.txt --lang de
```

## Ausgabe

- Drei Hooks mit Score, Band, Formel oder `abstain`, Dealbreaker
- Gewählter Hook und warum die anderen beiden zurückliegen
- Skript, Bildtext, Beat-Sheet, Flags
- Human-Score
- Copy-Block: Hook, Skript, Bildtext untereinander
