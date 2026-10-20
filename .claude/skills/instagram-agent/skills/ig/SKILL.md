---
name: ig
description: Routes an Instagram drafting task to the right workflow. Use when the user mentions Instagram, Reels, Captions, Karussell, Story, Profil, Wochenplan, Kommentare, DMs, or a post-mortem. Writes German or English. Does not post.
---

# Instagram

Wähle einen Ablauf und lies seine `SKILL.md`, bevor du schreibst. Arbeite diesen Ablauf ab. Nicht zwei Abläufe in einem Durchgang mischen.

| Auftrag | Skill |
| --- | --- |
| Reel, Hook, Skript, Beat-Sheet | `skills/ig-reel/SKILL.md` |
| Was in der Nische funktioniert, Swipe-Datei | `skills/ig-viral/SKILL.md` |
| Caption, Untertitel, Hashtags | `skills/ig-caption/SKILL.md` |
| Karussell, Slides | `skills/ig-carousel/SKILL.md` |
| Story, Sticker | `skills/ig-story/SKILL.md` |
| Profil, Bio, Raster | `skills/ig-profile/SKILL.md` |
| Woche, Content-Plan | `skills/ig-plan/SKILL.md` |
| Text menschlicher machen, Floskeln | `skills/ig-human/SKILL.md` |
| Kommentar unter einem fremden Beitrag | `skills/ig-comment/SKILL.md` |
| Antworten unter dem eigenen Beitrag | `skills/ig-reply/SKILL.md` |
| DM, Keyword, Collab | `skills/ig-dm/SKILL.md` |
| Ein langes Stück in mehrere Beiträge | `skills/ig-repurpose/SKILL.md` |
| Auswertung eigener Beiträge | `skills/ig-audit/SKILL.md` |

If the request names the workflow, go straight there. If it is only "write me an Instagram post", ask which format, once.

## Schranken

Lies die Stimme in `instagram/voice.md` im aktuellen Projekt, sonst in `~/.claude/instagram/voice.md`. Fehlt sie, sag das in einem Satz und arbeite mit dem Auftrag. Erfinde keine Biografie.

Sprache des Auftrags. Sonst `default_language` aus der Stimme.

Zahlen, Kunden und Ergebnisse nur aus Stimme oder Auftrag. Sonst `{{deine Zahl}}` oder `{{your number}}`.

Nichts posten, nicht einloggen, nichts scrapen, niemanden anschreiben. Am Ende ein Copy-Block.

Der Plugin-Root ist `$CLAUDE_PLUGIN_ROOT` oder zwei Ebenen über der jeweiligen Skill-Datei. Tools liegen in `lib/`.
