#!/usr/bin/env python3
"""Score spoken hooks. Specificity and the opening words carry the score."""

from __future__ import annotations

import argparse
import re
import sys

import igcommon

DEALBREAKERS = (
    (
        "greeting",
        re.compile(
            r"^\s*(hey guys|hey leute|hallo zusammen|hi friends|what's up|whats up|moin zusammen|hello everyone|hey everyone|hi everyone)\b",
            re.IGNORECASE,
        ),
        "Opens with a greeting. The feed did not come here to be welcomed.",
    ),
    (
        "attention-beg",
        re.compile(
            r"\b(stop scrolling|hör auf zu scrollen|hoer auf zu scrollen|hört auf zu scrollen|wait for it|bleib dran bis zum ende)\b",
            re.IGNORECASE,
        ),
        "Asks for attention before it has earned it.",
    ),
    (
        "preamble",
        re.compile(
            r"^\s*(in this video|in today's video|in todays video|heute zeige ich|in diesem video|today i wanted to|heute wollte ich|in diesem reel)\b",
            re.IGNORECASE,
        ),
        "Opens with a preamble. The claim should be the first words.",
    ),
)

FILLERS = (
    "so ",
    "also ",
    "um ",
    "uh ",
    "eigentlich ",
    "basically ",
    "okay so ",
    "heute mal ",
    "alright ",
)
STAKE_WORDS = (
    "lost", "verloren", "kostet", "cost", "costs", "mistake", "fehler",
    "risk", "risiko", "deadline", "frist", "refund", "erstattung",
    "broke", "pleite", "invoice", "rechnung", "penalty", "strafe",
    "wasted", "verschwendet",
)
ADDRESS = re.compile(
    r"\b(you|your|du|dir|dich|dein|deine|deinen|ihr|euch|euer|eure)\b",
    re.IGNORECASE,
)
CLAIM_VERBS = re.compile(
    r"\b(lost|verloren|replaced|ersetzt|kostet|cost|stopped|aufgehört|aufgehoert|skipped|gestrichen|charged|berechnet)\b",
    re.IGNORECASE,
)

WEIGHTS = {
    "specificity": 0.50,
    "frontload": 0.35,
    "stakes": 0.08,
    "address": 0.07,
}
WEAK_SIGNALS = ("stakes", "address")
DEALBREAKER_CAP = 22.0


def _specificity(text: str, lang: str) -> float:
    count = len(igcommon.concrete_markers(text, lang))
    if count <= 0:
        return 15.0
    if count == 1:
        return 62.0
    if count == 2:
        return 84.0
    return 96.0


def _frontload(text: str, lang: str) -> float:
    tokens = igcommon.words(text)
    head = " ".join(tokens[:6])
    if igcommon.concrete_markers(head, lang):
        score = 88.0
    elif CLAIM_VERBS.search(head):
        score = 72.0
    else:
        score = 34.0
    lowered = text.lstrip().lower()
    if lowered.startswith(FILLERS):
        score = min(score, 24.0)
    return score


def _stakes(text: str) -> float:
    lowered = text.lower()
    hits = sum(1 for word in STAKE_WORDS if word in lowered)
    return 58.0 if hits else 42.0


def _address(text: str) -> float:
    tokens = igcommon.words(text)[:8]
    if ADDRESS.search(" ".join(tokens)):
        return 70.0
    return 40.0


def match_formula(text: str, lang: str) -> dict | None:
    data = igcommon.load_json("hooks.json")
    best = None
    best_len = 0
    tied = False
    for formula in data["formulas"]:
        for pattern in formula.get("match", []):
            found = re.search(pattern, text, re.IGNORECASE)
            if not found:
                continue
            span = found.end() - found.start()
            if span < 8:
                continue
            if best is not None and formula["id"] == best["id"]:
                if span > best_len:
                    best_len = span
                    tied = False
                continue
            if span > best_len:
                best = formula
                best_len = span
                tied = False
            elif span == best_len and best is not None:
                tied = True
    if best is None or tied:
        return None
    return {
        "id": best["id"],
        "name": best["name"].get(lang) or best["name"].get("en"),
    }


def score_hook(text: str, lang: str | None = None) -> dict:
    cleaned = text.strip()
    lang = igcommon.resolve_lang(cleaned, lang)
    parts = {
        "specificity": _specificity(cleaned, lang),
        "frontload": _frontload(cleaned, lang),
        "stakes": _stakes(cleaned),
        "address": _address(cleaned),
    }
    score = sum(parts[key] * WEIGHTS[key] for key in WEIGHTS)
    deal = None
    for ident, pattern, reason in DEALBREAKERS:
        if pattern.search(cleaned):
            deal = {"id": ident, "reason": reason}
            score = min(score, DEALBREAKER_CAP)
            break
    score = round(score, 1)
    if score >= 75:
        band = "STRONG"
    elif score >= 50:
        band = "OK"
    else:
        band = "WEAK"
    return {
        "text": cleaned,
        "lang": lang,
        "score": score,
        "band": band,
        "parts": parts,
        "weak_signals": list(WEAK_SIGNALS),
        "dealbreaker": deal,
        "formula": match_formula(cleaned, lang),
    }


def render(results: list[dict]) -> str:
    lines = ["HOOKS", "specificity and the opening carry the score. stakes and address are weak signals."]
    ranked = sorted(results, key=lambda item: item["score"], reverse=True)
    for item in ranked:
        mark = "->" if item is ranked[0] else "  "
        lines.append(f"{mark} {item['score']:5.1f}  {item['band']:<6}  {item['text']}")
        part_bits = []
        for key in ("specificity", "frontload", "stakes", "address"):
            label = key
            if key in item["weak_signals"]:
                label += " (weak)"
            part_bits.append(f"{label} {item['parts'][key]:.0f}")
        lines.append("     " + ", ".join(part_bits))
        if item["formula"]:
            lines.append(f"     formula: {item['formula']['id']} · {item['formula']['name']}")
        else:
            lines.append("     formula: abstain")
        if item["dealbreaker"]:
            lines.append(f"     dealbreaker: {item['dealbreaker']['reason']}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Score one hook per line.")
    parser.add_argument("path", nargs="?", help="Text file, or stdin when omitted")
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    raw = igcommon.read_input(args.path)
    lang = None if args.lang == "auto" else args.lang
    hooks = [line.strip() for line in raw.splitlines() if line.strip()]
    if not hooks:
        print("No hooks to score.", file=sys.stderr)
        return 1
    print(render([score_hook(hook, lang) for hook in hooks]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
