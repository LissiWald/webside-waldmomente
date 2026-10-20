---
name: ig-caption
description: Writes an Instagram caption and lints the feed window, hashtag cap, and single ask. Use for a Caption, Untertitel, Hashtags, or the text under a Reel. Writes German or English. Does not post.
---

# Caption

Der Feed zeigt ungefähr die ersten 125 Zeichen, danach `... more`. Die Caption gewinnt oder verliert in diesem Fenster. Das Limit der App liegt bei 2200 Zeichen und 5 Hashtags. Steht in `lib/platform.json` etwas anderes, gilt die Datei. Weicht Instagram davon ab, gilt Instagram.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des Auftrags, sonst `default_language`.

Zahlen nur aus Stimme oder Auftrag. Sonst Platzhalter.

Nichts posten. Am Ende ein Copy-Block.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

1. Erste Zeile: die konkrete Aussage, vollständig, bevor das Fenster schneidet. Kein Vorspann.
2. Danach der Beleg und genau eine Handlungsaufforderung aus der Stimme. Kein zweites Ask.
3. Höchstens fünf Hashtags, eng am Thema. Null ist erlaubt.
4. Suchbegriffe aus dem Auftrag in den Text, nicht nur in die Tags.
5. Prüfen:

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/caption.py" caption.txt --keywords "begriff, zweiter" --lang de
```

6. WARN und FAIL beheben und erneut prüfen. Ein Schnitt mitten im Wort in der Vorschau ist ein FAIL für die erste Zeile, auch wenn das Tool WARN sagt.
7. Humanizer und Detect. Markierte Muster umschreiben, nicht die konkrete erste Zeile durch eine Floskel ersetzen.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" caption.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" caption.txt --lang de
```

## Ausgabe

- Die Box, die das Tool für das Feed-Fenster druckt
- Die Checks
- Human-Score
- Copy-Block: die fertige Caption
