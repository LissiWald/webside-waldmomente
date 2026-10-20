#!/usr/bin/env python3
"""Score a draft on five local checks. This is not a detector API."""

from __future__ import annotations

import argparse
import math
import re
import sys

import igcommon

PASS_AT = 70.0
SHOUT_RE = re.compile(r"\b[A-ZÄÖÜ]{3,}(?:\s+[A-ZÄÖÜ]{3,}){2,}\b")
EMOJI_LINE_RE = re.compile(r"(?m)^[ \t]*[\U0001F300-\U0001FAFF\u2600-\u27BF]")
HASHTAG_RE = re.compile(r"#[\wÄÖÜäöüß]+")


def _cv(lengths: list[int]) -> float:
    if len(lengths) < 2:
        return 0.45
    mean = sum(lengths) / len(lengths)
    if mean == 0:
        return 0.0
    variance = sum((item - mean) ** 2 for item in lengths) / len(lengths)
    return math.sqrt(variance) / mean


def _burstiness(text: str) -> tuple[float, str]:
    lengths = [len(igcommon.words(sentence)) for sentence in igcommon.sentences(text)]
    if len(lengths) < 3:
        return 70.0, "too few sentences to judge rhythm"
    cv = _cv(lengths)
    score = max(0.0, min(100.0, 15.0 + cv * 110.0))
    return score, f"sentence-length cv {cv:.2f}"


def _specificity(text: str, lang: str) -> tuple[float, str]:
    word_count = max(len(igcommon.words(text)), 1)
    markers = len(igcommon.concrete_markers(text, lang))
    per_100 = markers / word_count * 100.0
    score = max(0.0, min(100.0, 20.0 + per_100 * 16.0))
    return score, f"{per_100:.1f} concrete markers per 100 words"


def _phrase_hits(text: str, replacements: list[dict]) -> list[str]:
    lowered = text.lower()
    hits = []
    for item in replacements:
        source = item.get("from", "").strip().lower()
        if source and source in lowered:
            hits.append(source)
    return hits


def _slop(text: str) -> tuple[float, str]:
    replacements = []
    for name in ("slop.de.json", "slop.en.json"):
        replacements.extend(igcommon.load_json(name).get("replacements", []))
    hits = _phrase_hits(text, replacements)
    word_count = max(len(igcommon.words(text)), 1)
    per_100 = len(hits) / word_count * 100.0
    score = max(0.0, min(100.0, 100.0 - per_100 * 8.0))
    return score, f"{len(hits)} stock phrases, {per_100:.1f} per 100 words"


def _fingerprint(text: str) -> tuple[float, str]:
    score = 100.0
    notes = []
    em = text.count("—") + text.count("―")
    if em:
        score -= min(40.0, em * 15.0)
        notes.append(f"{em} em dash")
    curly = sum(text.count(char) for char in "“”‘’")
    if curly:
        score -= min(20.0, curly * 5.0)
        notes.append(f"{curly} curly quotes")
    if "…" in text:
        score -= 10.0
        notes.append("ellipsis character")
    _, invisible = igcommon.strip_invisible(text)
    if invisible:
        score -= min(40.0, invisible * 10.0)
        notes.append(f"{invisible} invisible")
    score = max(0.0, score)
    return score, ", ".join(notes) if notes else "no typography fingerprint"


def _tells(text: str) -> tuple[float, str, list[dict]]:
    found: list[dict] = []
    for name in ("slop.de.json", "slop.en.json"):
        for tell in igcommon.load_json(name).get("tells", []):
            if re.search(tell["pattern"], text, re.IGNORECASE):
                found.append({"id": tell["id"], "note": tell["note"]})
    if SHOUT_RE.search(text):
        found.append({"id": "shouted-run", "note": "Three shouted words in a row. Say one of them."})
    if EMOJI_LINE_RE.search(text):
        found.append({"id": "emoji-bullets", "note": "Emoji bullets. Write the line without the icon."})
    if len(HASHTAG_RE.findall(text)) >= 6:
        found.append({"id": "hashtag-wall", "note": "More than five hashtags. The app cap is five."})
    lengths = [len(igcommon.words(sentence)) for sentence in igcommon.sentences(text)]
    if len(lengths) >= 4 and _cv(lengths) < 0.18:
        found.append({"id": "uniform-sentences", "note": "Sentences are almost the same length. Vary them."})
    unique = []
    seen = set()
    for item in found:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        unique.append(item)
    score = max(0.0, 100.0 - len(unique) * 12.0)
    detail = f"{len(unique)} structural tells" if unique else "no structural tells"
    return score, detail, unique


def score_text(text: str, lang: str | None = None) -> dict:
    lang = igcommon.resolve_lang(text, lang)
    burst, burst_detail = _burstiness(text)
    spec, spec_detail = _specificity(text, lang)
    slop, slop_detail = _slop(text)
    finger, finger_detail = _fingerprint(text)
    voice, voice_detail, tells = _tells(text)
    parts = {
        "burstiness": (burst, burst_detail),
        "specificity": (spec, spec_detail),
        "slop": (slop, slop_detail),
        "fingerprint": (finger, finger_detail),
        "voice": (voice, voice_detail),
    }
    total = round(sum(value for value, _detail in parts.values()) / len(parts), 1)
    return {
        "lang": lang,
        "score": total,
        "band": "PASS" if total >= PASS_AT else "FLAGGED",
        "parts": parts,
        "tells": tells,
    }


def _bar(score: float) -> str:
    filled = int(round(score / 100 * 24))
    return "#" * filled + "." * (24 - filled)


def render(report: dict, previous: dict | None = None) -> str:
    lines = []
    for key in ("burstiness", "specificity", "slop", "fingerprint", "voice"):
        value, detail = report["parts"][key]
        lines.append(f"  {key.upper():<13} {_bar(value)}  {value:5.1f}  {detail}")
    delta = ""
    if previous is not None:
        gap = report["score"] - previous["score"]
        delta = f"  ({gap:+.1f})"
    lines.append(f"  HUMAN SCORE   {_bar(report['score'])}  {report['score']:5.1f}  {report['band']}{delta}")
    for tell in report["tells"]:
        lines.append(f"  tell {tell['id']}: {tell['note']}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Score a draft, or compare two files.")
    parser.add_argument("before", help="Draft file")
    parser.add_argument("after", nargs="?", help="Optional second file for a delta")
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    lang = None if args.lang == "auto" else args.lang
    before_text = igcommon.read_input(args.before)
    before = score_text(before_text, lang)
    after = score_text(igcommon.read_input(args.after), lang) if args.after else None
    if after is None:
        print(render(before))
    else:
        print(render(before))
        print("---")
        print(render(after, before))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
