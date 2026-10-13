---
name: ig-viral
description: Ranks reels the user captured by how far each beat that account's own median, then names the hook formula or abstains. Use for a swipe file, Nischen-Recherche, or outlier reels. Does not scrape or log in.
---

# Was funktioniert

Roh-Views sind kein Beleg. Ein großes Konto mit vielen Views hatte einen normalen Tag. Ein kleines Konto mit dem Vielfachen seines eigenen Medians hat etwas getroffen.

Dieses Skill liest eine Datei, die der Nutzer selbst gefüllt hat. Es öffnet Instagram nicht, es loggt sich nicht ein, es sammelt nichts automatisch.

## Schranken

Lies `instagram/voice.md` im Projekt, sonst `~/.claude/instagram/voice.md`.

Sprache der Hooks in der Datei lassen. Deine Zusammenfassung in der Sprache des Auftrags.

Nichts scrapen, nichts posten.

Plugin-Root: `$CLAUDE_PLUGIN_ROOT`, sonst zwei Ebenen über dieser Datei.

## Datei

Tab-getrennt, Kopfzeile Pflicht:

```text
account	baseline	views	hook
@atelier	4000	90000	Niemand sagt dir, dass die zweite Mahnung ruhiger sein muss.
```

`baseline` ist der Median der Views dieses Kontos, nicht die Followerzahl, wenn der Nutzer den Median hat. Follower nur, wenn er keinen Median nennen kann, und dann sag das in der Auswertung.

Optional: `sends` und `reach`.

Zehn Konten, etwa ein Dutzend Reels, in dem Tempo, in dem der Nutzer selbst schaut. Wenn die Datei fehlt, gib die Kopfzeile aus und warte. Erfinde keine Zeilen.

## Ablauf

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/swipe.py" captured.tsv --out swipe.md
```

Lies die Ausgabe. `abstain` bleibt `abstain`. Eine Formel nicht erzwingen.

Vergleiche das obere Drittel mit dem unteren: welches konkrete Ding in den oberen Hooks steht, das unten fehlt. Keine Reichweiten-Prognose.

Die drei Sätze der Zusammenfassung durch den Humanizer, die Hooks in der Datei nicht verändern.

```bash
python3 "$CLAUDE_PLUGIN_ROOT/lib/humanize.py" summary.txt --report --lang de
python3 "$CLAUDE_PLUGIN_ROOT/lib/detect.py" summary.txt --lang de
```

## Ausgabe

- Die Rangliste aus dem Tool
- Drei Sätze, was das obere Drittel vom unteren trennt
- Eine Swipe-Notiz, die der Nutzer behalten kann: Account, Vielfaches, Hook, Formel
- Kein Skript, außer der Nutzer fragt danach. Dann `skills/ig-reel/SKILL.md`
