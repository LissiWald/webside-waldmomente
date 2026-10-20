#!/usr/bin/env python3
"""Show the feed window and lint a caption against current Instagram limits."""

from __future__ import annotations

import argparse
import re
import sys

import igcommon

HASHTAG_RE = re.compile(r"#[\wÄÖÜäöüß]+", re.UNICODE)
CTA_PATTERNS = (
    ("comment", re.compile(r"\b(comment|kommentier\w*|schreib\w+)\b", re.IGNORECASE)),
    ("follow", re.compile(r"\b(follow|folg\w*)\b", re.IGNORECASE)),
    ("save", re.compile(r"\b(save|speicher\w*)\b", re.IGNORECASE)),
    ("share", re.compile(r"\b(share|schick\w*|teilt|teilen)\b", re.IGNORECASE)),
    ("link", re.compile(r"\b(link in|link in der bio|bio link)\b", re.IGNORECASE)),
    ("dm", re.compile(r"\b(dm me|schick mir|nachricht)\b", re.IGNORECASE)),
)


def _asks(text: str) -> list[str]:
    return [name for name, pattern in CTA_PATTERNS if pattern.search(text)]


def lint_caption(text: str, keywords: list[str] | None = None, lang: str | None = None) -> dict:
    limits = igcommon.platform()
    preview_len = int(limits["feed_preview_chars"])
    caption_max = int(limits["caption_max"])
    hashtag_max = int(limits["hashtag_max"])
    mention_max = int(limits["mention_max"])
    cleaned = text.strip()
    lang = igcommon.resolve_lang(cleaned, lang)
    preview = cleaned[:preview_len]
    cut_mid_word = len(cleaned) > preview_len and preview_len > 0 and cleaned[preview_len - 1].isalnum() and cleaned[preview_len:preview_len + 1].isalnum()
    first_line = cleaned.splitlines()[0] if cleaned else ""
    hashtags = HASHTAG_RE.findall(cleaned)
    mentions = re.findall(r"@[\w.]+", cleaned)
    checks = []

    length_ok = len(cleaned) <= caption_max
    checks.append({
        "id": "length",
        "status": "PASS" if length_ok else "FAIL",
        "detail": f"{len(cleaned)} / {caption_max} characters",
    })

    if len(first_line) <= preview_len and not cut_mid_word:
        first_status = "PASS"
        first_detail = f"first line is {len(first_line)} characters and fits the feed window"
    else:
        first_status = "WARN"
        first_detail = f"feed window cuts at {preview_len} characters"
        if cut_mid_word:
            first_detail += ", mid-word"
        elif len(first_line) > preview_len:
            first_detail += ", mid-thought"
    checks.append({"id": "first_line", "status": first_status, "detail": first_detail})

    concrete = igcommon.concrete_markers(preview, lang)
    checks.append({
        "id": "concrete",
        "status": "PASS" if concrete else "WARN",
        "detail": f"{len(concrete)} concrete markers in the visible window" if concrete else "nothing concrete in the visible window",
    })

    if len(hashtags) > hashtag_max:
        tag_status = "FAIL"
    elif hashtags:
        tag_status = "PASS"
    else:
        tag_status = "PASS"
    tag_detail = f"{len(hashtags)} / {hashtag_max} hashtags"
    if hashtags:
        tag_detail += ": " + " ".join(hashtags)
    checks.append({"id": "hashtags", "status": tag_status, "detail": tag_detail})

    if len(mentions) > mention_max:
        checks.append({
            "id": "mentions",
            "status": "FAIL",
            "detail": f"{len(mentions)} / {mention_max} mentions",
        })

    asks = _asks(cleaned)
    if len(asks) == 1:
        ask_status = "PASS"
        ask_detail = f"one ask: {asks[0]}"
    elif not asks:
        ask_status = "WARN"
        ask_detail = "no ask"
    else:
        ask_status = "WARN"
        ask_detail = "more than one ask: " + ", ".join(asks)
    checks.append({"id": "one_ask", "status": ask_status, "detail": ask_detail})

    missing = []
    present = []
    for keyword in keywords or []:
        needle = keyword.strip()
        if not needle:
            continue
        if needle.lower() in cleaned.lower():
            present.append(needle)
        else:
            missing.append(needle)
    if keywords:
        if missing:
            key_status = "WARN"
            key_detail = f"{len(present)}/{len(present) + len(missing)} present. Missing: {', '.join(missing)}"
        else:
            key_status = "PASS"
            key_detail = f"{len(present)}/{len(present)} search terms present"
        checks.append({"id": "search_terms", "status": key_status, "detail": key_detail})

    return {
        "lang": lang,
        "preview": preview,
        "preview_len": preview_len,
        "cut": len(cleaned) > preview_len,
        "checks": checks,
    }


def render(report: dict) -> str:
    width = 54
    preview = report["preview"]
    chunks = [preview[i:i + width] for i in range(0, max(len(preview), 1), width)]
    box = ["WHAT THE FEED SHOWS", "+" + "-" * (width + 2) + "+"]
    for chunk in chunks:
        box.append("| " + chunk.ljust(width) + " |")
    if report["cut"]:
        box.append("+" + "-" * (width - 10) + " ... more +")
    else:
        box.append("+" + "-" * (width + 2) + "+")
    for check in report["checks"]:
        box.append(f"  {check['status']:<4}  {check['id']:<14} {check['detail']}")
    return "\n".join(box)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Lint an Instagram caption.")
    parser.add_argument("path", nargs="?", help="Caption file, or stdin when omitted")
    parser.add_argument("--keywords", default="", help="Comma-separated search terms")
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    raw = igcommon.read_input(args.path)
    if not raw.strip():
        print("No caption to lint.", file=sys.stderr)
        return 1
    keywords = [part.strip() for part in args.keywords.split(",") if part.strip()]
    lang = None if args.lang == "auto" else args.lang
    print(render(lint_caption(raw, keywords, lang)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
