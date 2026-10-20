#!/usr/bin/env python3
"""Rank captured reels by how far each beat its own account, not by raw views."""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

import hookscore
import igcommon


def _number(value: str) -> float:
    cleaned = value.strip().replace(" ", "").replace(",", "")
    if not cleaned:
        raise ValueError("empty number")
    return float(cleaned)


def load_rows(text: str) -> list[dict]:
    sample = text.splitlines()[0] if text.strip() else ""
    delimiter = "\t" if "\t" in sample else ","
    reader = csv.DictReader(text.splitlines(), delimiter=delimiter)
    if not reader.fieldnames:
        raise ValueError("TSV needs a header row.")
    fields = {name.strip().lower(): name for name in reader.fieldnames}
    required = ("account", "baseline", "views", "hook")
    missing = [name for name in required if name not in fields]
    if missing:
        raise ValueError("Missing columns: " + ", ".join(missing))
    rows = []
    for raw in reader:
        if not any((raw.get(key) or "").strip() for key in raw):
            continue
        row = {
            "account": (raw[fields["account"]] or "").strip(),
            "baseline": _number(raw[fields["baseline"]]),
            "views": _number(raw[fields["views"]]),
            "hook": (raw[fields["hook"]] or "").strip(),
        }
        if "sends" in fields and "reach" in fields:
            sends = (raw[fields["sends"]] or "").strip()
            reach = (raw[fields["reach"]] or "").strip()
            if sends and reach:
                row["sends"] = _number(sends)
                row["reach"] = _number(reach)
                row["sends_per_reach"] = row["sends"] / row["reach"] if row["reach"] else None
        if row["baseline"] <= 0:
            row["multiple"] = None
        else:
            row["multiple"] = row["views"] / row["baseline"]
        rows.append(row)
    return rows


def rank_rows(rows: list[dict], lang: str | None = None) -> dict:
    ranked = []
    for row in rows:
        item = dict(row)
        item["formula"] = hookscore.match_formula(item["hook"], igcommon.resolve_lang(item["hook"], lang))
        item["hook_score"] = hookscore.score_hook(item["hook"], lang)
        ranked.append(item)
    ranked.sort(key=lambda item: (item["multiple"] is not None, item["multiple"] or -1), reverse=True)
    count = len(ranked)
    cut = max(count // 3, 1) if count else 0
    top = ranked[:cut] if count >= 3 else ranked
    bottom = ranked[-cut:] if count >= 3 else []
    return {"rows": ranked, "top": top, "bottom": bottom}


def _mean_multiple(rows: list[dict]) -> float | None:
    values = [row["multiple"] for row in rows if row["multiple"] is not None]
    if not values:
        return None
    return sum(values) / len(values)


def render(report: dict) -> str:
    rows = report["rows"]
    lines = [f"SWIPE  ·  {len(rows)} reels  ·  baseline: each account's own median"]
    for row in rows:
        multiple = "  n/a" if row["multiple"] is None else f"{row['multiple']:5.1f}x"
        formula = row["formula"]["id"] if row["formula"] else "abstain"
        lines.append(f"  {multiple}  {formula:<18}  {row['account']:<16}  {row['views']:.0f} views")
        lines.append(f"           {row['hook']}")
        if row.get("sends_per_reach") is not None:
            lines.append(f"           sends/reach {row['sends_per_reach']:.3f}")
    if len(rows) < 3:
        lines.append("Need at least 3 rows before a top-third comparison.")
        return "\n".join(lines)
    top_mean = _mean_multiple(report["top"])
    bottom_mean = _mean_multiple(report["bottom"])
    lines.append("TOP THIRD VS BOTTOM THIRD")
    if top_mean is not None and bottom_mean is not None:
        lines.append(f"  mean multiple  top {top_mean:.1f}x   bottom {bottom_mean:.1f}x")
    top_formulas = sorted({row["formula"]["id"] for row in report["top"] if row["formula"]})
    bottom_formulas = sorted({row["formula"]["id"] for row in report["bottom"] if row["formula"]})
    lines.append("  formulas on top: " + (", ".join(top_formulas) if top_formulas else "none classified"))
    lines.append("  formulas on the bottom: " + (", ".join(bottom_formulas) if bottom_formulas else "none classified"))
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Rank a swipe file by account-relative multiple.")
    parser.add_argument("path", help="TSV or CSV with account, baseline, views, hook")
    parser.add_argument("--out", help="Also write the report to this path")
    parser.add_argument("--lang", choices=("de", "en", "auto"), default="auto")
    args = parser.parse_args(argv)
    lang = None if args.lang == "auto" else args.lang
    try:
        rows = load_rows(Path(args.path).read_text(encoding="utf-8"))
    except (ValueError, OSError, csv.Error) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    if not rows:
        print("No rows to rank.", file=sys.stderr)
        return 1
    text = render(rank_rows(rows, lang))
    print(text)
    if args.out:
        Path(args.out).write_text(text + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
