---
name: ig-reply
description: Sorts comments under your own Instagram post into keyword, lead, substance, question, support, and noise, then drafts replies in that order. Use for Antworten unter dem eigenen Beitrag. Does not post them.
---

# Antworten

Die Kommentare unter dem eigenen Beitrag sortieren und in einer festen Reihenfolge beantworten. Der Nutzer fügt die Kommentare ein. Nichts abrufen.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des jeweiligen Kommentars.

Keine Preise, Termine oder Ergebnisse erfunden. Wenn eine Antwort eine Zahl braucht, die nicht da ist, Platzhalter.

Nichts posten, keine DM von hier aus öffnen. Ein Keyword-Kommentar verweist auf den Entwurf in `skills/ig-dm/SKILL.md`, sendet ihn aber nicht.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Reihenfolge

1. `keyword` — die Person hat das vereinbarte Wort geschrieben. Antwort bestätigt das Wort und sagt, dass die Nachricht als Nächstes kommt. Nicht den ganzen Liefertext in den Kommentar.
2. `lead` — die Person fragt nach Zusammenarbeit oder einem Preis. Eine sachliche Antwort, ein nächster Schritt, kein Rabatt aus der Luft.
3. `substance` — die Person ergänzt einen Fall oder einen Widerspruch. Darauf eingehen, nicht nur danken.
4. `question` — eine beantwortbare Frage. Die Antwort in den Kommentar, nicht "DM mich" als Ausweichen, außer die Antwort wirklich nicht öffentlich gehört.
5. `support` — Dank oder Zustimmung. Ein kurzer Satz, der etwas Konkretes aus ihrem Kommentar aufnimmt.
6. `noise` — nur Emoji, Werbung, Beleidigung. Keine Antwort, oder ein Wort, wenn der Ton freundlich und leer ist. Kein Pitch.

Innerhalb einer Stufe: zuerst die Kommentare, die eine Entscheidung brauchen.

## Ablauf

Liste jede Zeile mit Stufe und Entwurf. Humanizer über die Entwürfe, die länger als ein Satz sind.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" replies.txt --report --lang de
```

## Ausgabe

- Sortierte Liste
- Copy-Block pro Antwort, mit dem Kommentar darüber, damit klar ist, worauf sie gehört
