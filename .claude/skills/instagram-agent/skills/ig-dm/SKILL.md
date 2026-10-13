---
name: ig-dm
description: Drafts a keyword delivery for Instagram's own reply tool, a first message, a collab pitch, and at most two follow-ups. Use for a DM, Keyword, or Collab. Does not send messages.
---

# Direktnachricht

Entwürfe. Nichts wird gesendet. Die Keyword-Antwort ist ein Text für Instagrams eigene Antwortfunktion oder einen zugelassenen Partner. Sie feuert nur, nachdem jemand das Wort kommentiert hat. Kein Massenversand, kein Tool, das die DMs selbst öffnet.

Höchstens zwei Follow-ups. Danach ist die Kette zu Ende.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des Auftrags, sonst `default_language`.

Nichts versprechen, was nicht in der Stimme steht. Kein erfundener Social Proof.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Die vier Texte

1. Keyword-Lieferung. Das Wort aus der Stimme oder dem Auftrag. Der Text liefert, was das Wort versprochen hat: den Satz, den Link, die Liste. Kurz genug für eine DM. Kein zweites Angebot in derselben Nachricht.
2. Erste menschliche Nachricht, nur für den Fall, dass die Person auf die Lieferung antwortet. Eine Frage zu ihrem Fall, keine zweite Werbebotschaft.
3. Collab. Nur wenn der Auftrag eine Zusammenarbeit ist. Ein Satz, was du konkret vorschlägst, ein Satz, was die andere Seite davon hat, ein Satz zum nächsten Schritt. Kein "Synergien".
4. Follow-up eins, nach einer Lücke, die der Nutzer nennt. Ein neuer Grund, kein Wiederholen.
5. Follow-up zwei. Kürzer als das erste. Danach keine dritte Fassung anbieten.

Wenn der Auftrag nur die Keyword-Lieferung ist, schreibe nicht die Collab dazu.

## Ablauf

Humanizer auf jeden Text, der länger als zwei Sätze ist.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" dm.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" dm.txt --lang de
```

## Ausgabe

- Welcher Text für welchen Moment
- Die Grenze: zwei Follow-ups, dann Schluss
- Copy-Block je Nachricht
