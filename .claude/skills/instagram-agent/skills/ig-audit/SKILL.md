---
name: ig-audit
description: Reviews the user's own Instagram posts by outlier multiple and sends per reach. Use for a post-mortem, Auswertung, or Insights. Does not fetch analytics and does not post.
---

# Auswertung

Ein Rückblick auf Beiträge, die der Nutzer selbst exportiert oder abschreibt. Views allein sortieren nicht. Das Vielfache gegenüber dem eigenen Median und Sends pro Reach schon.

Nichts aus Instagram abrufen. Keine Insights raten. Fehlt eine Spalte, die Zeile aus der jeweiligen Rechnung lassen und das sagen.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`, damit die Vorschläge zur Stimme passen.

Sprache des Auftrags.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Datei

Tab-getrennt:

```text
account	baseline	views	hook	sends	reach
@ich	8000	42000	Hier ist die Zeile aus der Rechnung.	90	15000
```

`account` ist das eigene Konto, `baseline` der Median der eigenen Views. `sends` und `reach` optional, aber für Sends pro Reach nötig.

Wenn der Nutzer eine unordentliche Liste schickt, in dieses Format bringen und es ihm zeigen, bevor du rechnest. Keine Zelle füllen, die er nicht geliefert hat.

## Ablauf

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/swipe.py" insights.tsv
```

Lies die Rangliste. Zusätzlich, wo `sends` und `reach` stehen: Sends pro Reach neben dem View-Vielfachen. Ein Beitrag kann viele Views und wenige Sends haben. Den nicht als Gewinner behandeln, wenn die Sends-Quote unten liegt.

Sag, welche Formel oben vorkommt und welche unten fehlt. `abstain` nicht zu einer Formel reden.

Drei nächste Beiträge vorschlagen, die das wiederholen, was oben konkret war: Gegenstand, Zahl, Satzbau. Dafür die Hooks durch `hookscore.py` jagen. Keine Reichweite versprechen.

Humanizer auf die neuen Hooks.

## Ausgabe

- Rangliste
- Was die oberen von den unteren trennt, in konkreten Wörtern
- Drei nächste Hooks mit Score
- Copy-Block der drei Hooks
