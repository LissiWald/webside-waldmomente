#!/usr/bin/env python3
"""Strip invisible characters, odd typography, and stock phrases. Leave sentence shape alone."""

from __future__ import annotations

import argparse
import sys

import igcommon


def lexicon_for(lang: str) -> list[dict]:
    data = igcommon.load_json(f"slop.{lang}.json")
    return list(data.get("replacements", []))


def humanize(text: str, lang: str | None = None) -> tuple[str, list[dict]]:
    lang = igcommon.resolve_lang(text, lang)
    cleaned, invisible = igcommon.strip_invisible(text)
    changes: list[dict] = []
    if invisible:
        changes.append({"kind": "invisible", "count": invisible})
    cleaned, type_changes = igcommon.fix_typography(cleaned)
    changes.extend(type_changes)
    cleaned, word_changes = igcommon.apply_replacements(cleaned, lexicon_for(lang))
    changes.extend(word_changes)
    return cleaned, changes


def render_report(changes: list[dict], cleaned: str) -> str:
    lines = ["CHANGES"]
    if not changes:
        lines.append("  none")
    for change in changes:
        if change["kind"] == "invisible":
            lines.append(f"  invisible  removed {change['count']}")
        else:
            target = change.get("to") or "(removed)"
            lines.append(f"  {change['kind']:<12} {change['from']} -> {target}  x{change['count']}")
    lines.append("---")
    lines.append(cleaned)
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Clean a draft. Sentence shape is left for a rewrite.")
    parser.add_argument("path", nargs="?", help="Draft file, or stdin when omitted")
    parser.add_argument("--report", action="store_true", help="Print each change, then the text")
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    raw = igcommon.read_input(args.path)
    lang = None if args.lang == "auto" else args.lang
    cleaned, changes = humanize(raw, lang)
    if args.report:
        print(render_report(changes, cleaned))
    else:
        print(cleaned)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
