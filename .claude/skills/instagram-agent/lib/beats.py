#!/usr/bin/env python3
"""Turn a line-per-beat script into a timed sheet."""

from __future__ import annotations

import argparse
import sys

import igcommon

CTA_RE = (
    "comment", "kommentier", "comment the", "schreib", "folge", "follow",
    "link in", "speicher", "save this", "reply", "antworte", "dm ",
)


def _role(index: int, last: int, line: str) -> str:
    if index == 0:
        return "HOOK"
    lowered = line.lower()
    if index == last and any(cue in lowered for cue in CTA_RE):
        return "CTA"
    if index == last:
        return "CLOSE"
    return "MID"


def _loops(hook: str, close: str, lang: str) -> bool:
    markers = [item.lower() for item in igcommon.concrete_markers(hook, lang)]
    close_low = close.lower()
    if any(marker.lower() in close_low for marker in markers):
        return True
    close_tokens = set(igcommon.content_tokens(close))
    return any(token in close_tokens for token in igcommon.content_tokens(hook))


def beat_sheet(script: str, target: float = 30.0, wpm: float = 165.0, lang: str | None = None) -> dict:
    lines = [line.strip() for line in script.splitlines() if line.strip()]
    lang = igcommon.resolve_lang(script, lang)
    beats = []
    cursor = 0.0
    last = max(len(lines) - 1, 0)
    for index, line in enumerate(lines):
        count = max(len(igcommon.words(line)), 1)
        seconds = count / wpm * 60.0
        beats.append({
            "index": index,
            "role": _role(index, last, line),
            "text": line,
            "words": count,
            "start": cursor,
            "seconds": seconds,
            "concrete": bool(igcommon.concrete_markers(line, lang)),
        })
        cursor += seconds
    flags: list[str] = []
    if beats and beats[0]["seconds"] > 3.0:
        flags.append("Hook runs past 3s. Cut it until the claim fits in one breath.")
    for beat in beats:
        if beat["seconds"] > 4.0:
            flags.append(
                f"Beat {beat['index'] + 1} runs {beat['seconds']:.1f}s. Split the line or change the frame inside it."
            )
    dry = 0
    worst = 0
    for beat in beats[1:]:
        if beat["concrete"]:
            dry = 0
        else:
            dry += 1
            worst = max(worst, dry)
    if worst >= 3:
        flags.append("Three beats in a row have nothing concrete in them. Put a number, name, or object back in.")
    loop = False
    if len(beats) >= 2:
        loop = _loops(beats[0]["text"], beats[-1]["text"], lang)
        if not loop:
            flags.append("The last line does not return to the hook. Repeat one concrete token from the first line.")
    gap = target - cursor
    if abs(gap) >= 2.0:
        words_delta = abs(gap) * wpm / 60.0
        if gap > 0:
            flags.append(
                f"{gap:.1f}s under the {target:.0f}s target. Add about {words_delta:.0f} words, or shoot it short."
            )
        else:
            flags.append(
                f"{abs(gap):.1f}s over the {target:.0f}s target. Cut about {words_delta:.0f} words."
            )
    return {
        "lang": lang,
        "wpm": wpm,
        "target": target,
        "seconds": cursor,
        "words": sum(beat["words"] for beat in beats),
        "beats": beats,
        "loops": loop,
        "flags": flags,
    }


def _clock(seconds: float) -> str:
    whole = int(seconds)
    return f"{whole // 60}:{whole % 60:02d}.{int((seconds - whole) * 10)}"


def render(sheet: dict) -> str:
    lines = [
        f"BEATS  ·  {sheet['words']} words  ·  {sheet['seconds']:.1f}s at {sheet['wpm']:.0f} wpm  ·  target {sheet['target']:.0f}s"
    ]
    for beat in sheet["beats"]:
        lines.append(
            f"  {_clock(beat['start']):>7}  {beat['seconds']:4.1f}s  {beat['role']:<5}  {beat['text']}"
        )
    if sheet["loops"]:
        lines.append("Loop: the close returns to the hook.")
    if not sheet["flags"]:
        lines.append("No timing flags.")
    for flag in sheet["flags"]:
        lines.append(f"- {flag}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Time a script. One beat per line.")
    parser.add_argument("path", nargs="?", help="Script file, or stdin when omitted")
    parser.add_argument("--target", type=float, default=30.0)
    parser.add_argument("--wpm", type=float, default=165.0)
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    raw = igcommon.read_input(args.path)
    if not raw.strip():
        print("No script to time.", file=sys.stderr)
        return 1
    lang = None if args.lang == "auto" else args.lang
    print(render(beat_sheet(raw, target=args.target, wpm=args.wpm, lang=lang)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
