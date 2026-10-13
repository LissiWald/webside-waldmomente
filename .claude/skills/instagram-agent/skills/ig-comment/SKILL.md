---
name: ig-comment
description: Drafts a comment on someone else's Instagram post, chosen from nine types by what the post actually is. Use for a Kommentar under another account. Writes German or English. Does not post the comment.
---

# Kommentar

Ein Kommentar unter einem fremden Beitrag. Er bezieht sich auf etwas, das in dem Beitrag steht. Kein Feuer-Emoji, keine Reihe aus Ausrufezeichen, kein "tolle Insights".

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`. Der Kommentar klingt wie diese Stimme, in kurz.

Sprache des Beitrags, außer der Auftrag sagt etwas anderes.

Nichts behaupten, was nicht im Beitrag oder in der Stimme steht. Nichts posten.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Typen

Wähle einen, passend zum Beitrag. Wenn keiner passt, schreibe keinen Kommentar und sag das.

1. `detail` — ein Gegenstand, eine Zahl oder ein Satz aus dem Beitrag
2. `fall` — ein eigener Fall in einem Satz, nur wenn er in der Stimme steht
3. `frage` — eine Frage, die der Beitrag offen lässt und die du wirklich meinst
4. `nachtrag` — eine Ergänzung, nur wenn du sie belegen kannst
5. `hinweis` — auf etwas zeigen, das der Beitrag schon genannt hat, ohne das eigene Angebot
6. `widerspruch` — ein klarer Gegenpunkt, ohne Kette von Antworten
7. `anerkennung` — benennen, was funktioniert hat, ohne Adjektiv-Häufung
8. `ort` — eine Grenze aus Stadt, Handwerk oder Uhrzeit
9. `lassen` — kein Kommentar

Der Kommentar hat höchstens zwei Sätze. Er bittet nicht um einen Follow. Er legt keinen Link.

## Ablauf

Zeig den gewählten Typ in einem Wort. Schreibe den Kommentar. Dann:

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" comment.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" comment.txt --lang de
```

## Ausgabe

- Typ
- Human-Score
- Copy-Block: der Kommentar
