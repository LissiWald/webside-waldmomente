---
name: ig-plan
description: Plans one week of Instagram posts with format, timing, and ten accounts to engage with. Use for a Wochenplan, Content-Plan, or posting calendar. Writes German or English. Does not post or follow anyone.
---

# Woche

Eine Woche, die sich drehen lässt. Jeder Beitrag steht für sich. Engagement ist eine konkrete Antwort unter einem konkreten Beitrag, kein Follow-Lauf.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache des Auftrags, sonst `default_language`.

Keine erfundenen Reichweiten. Keine Accounts erfinden, wenn der Nutzer keine nennt. Dann zehn Plätze mit der Art von Konto offen lassen, zum Beispiel "Werkstatt in derselben Stadt", ohne einen Namen zu raten.

Nichts posten, niemandem folgen, um der Folge willen.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

Frag einmal nach den Tagen, an denen gedreht werden kann, wenn die Stimme das nicht sagt.

Vier bis sechs Beiträge. Pro Beitrag:

- Tag und eine Uhrzeit als Vorschlag, nicht als Versprechen
- Format: Reel, Karussell oder Story
- Eine Idee in einem Satz
- Formel-ID aus `lib/hooks.json`, wenn es ein Reel ist, sonst die Aufgabe der ersten Karte
- Der Gegenstand, der im Bild sein muss

Dazu zehn Konten oder zehn offene Plätze. Pro Platz: warum dieses Konto, unter welcher Art Beitrag, welcher Kommentar-Typ aus `skills/ig-comment/SKILL.md`. Kein "folg ihnen und sie folgen zurück".

Die Woche nicht mit drei gleichen Hooks füllen. Höchstens zwei Beiträge mit derselben Formel.

Humanizer über die Hook-Zeilen, nicht über die Tabelle.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" hooks.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" hooks.txt --lang de
```

## Ausgabe

- Woche als Liste
- Die zehn Engagement-Plätze
- Copy-Block nur für die Hook-Zeilen, die schon ausformuliert sind
