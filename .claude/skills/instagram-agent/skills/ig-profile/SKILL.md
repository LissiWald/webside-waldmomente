---
name: ig-profile
description: Scores an Instagram profile out of 100 against a 12-part rubric and rewrites the parts that lost points, lowest first. Use for Profil, Bio, Highlights, or the grid. Writes German or English. Does not log in or edit the profile.
---

# Profil

Das Profil wird aus dem bewertet, was der Nutzer einfügt: Name, Nutzername, Bio, Link, Highlights, die letzten neun Beiträge, die angehefteten Beiträge. Nichts davon selbst abrufen.

Die Rubrik steht in `lib/rubric.json`. Die Punkte addieren sich zu 100. Bio-Limit 150 Zeichen, aus `lib/platform.json`.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`. Die Stimme ist der Maßstab für Beweis und Ton. Ein Beweis, der nicht dort steht, bekommt keine Punkte und wird nicht erfunden.

Sprache des Auftrags, sonst `default_language`.

Nichts im Profil ändern. Am Ende Texte zum Kopieren.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Ablauf

1. Wenn Name, Bio oder Raster fehlen, einmal danach fragen. Nicht raten.
2. Für jeden Teil der Rubrik: Punkte, was fehlt, in einem Satz.
3. Summe.
4. Umschreiben in der Reihenfolge der verlorenen Punkte, die größten Lücken zuerst. Name, Bio und erster Highlight-Titel sagen dasselbe Angebot.
5. Bio durch den Humanizer. Die 150 Zeichen danach noch einmal zählen.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" bio.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" bio.txt --lang de
```

## Ausgabe

- Tabelle: Teil, Punkte, Maximum, Lücke
- Summe von 100
- Neue Fassung nur für die Teile, die Punkte verloren haben
- Copy-Block: Name, Bio, Highlight-Titel
