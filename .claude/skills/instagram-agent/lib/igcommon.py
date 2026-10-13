"""Text helpers shared by the local Instagram tools. Standard library only."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

LIB = Path(__file__).resolve().parent

INVISIBLE_DELETE = {
    "\u00ad",
    "\u034f",
    "\u061c",
    "\u180e",
    "\u200b",
    "\u200c",
    "\u200d",
    "\u200e",
    "\u200f",
    "\u202a",
    "\u202b",
    "\u202c",
    "\u202d",
    "\u202e",
    "\u2060",
    "\u2061",
    "\u2062",
    "\u2063",
    "\u2064",
    "\u2066",
    "\u2067",
    "\u2068",
    "\u2069",
    "\ufeff",
}
INVISIBLE_TO_SPACE = {"\u00a0", "\u202f", "\u2007", "\u2009", "\u200a"}
TAG_RE = re.compile(r"[\U000E0000-\U000E007F]")

DE_HINTS = re.compile(
    r"\b(und|der|die|das|nicht|ich|für|mit|ein|eine|auf|ist|dass|auch|wir|ihr|dein|deine|zum|zur|vom|beim|nach|wenn|oder|aber|euch|einen)\b",
    re.IGNORECASE,
)
EN_HINTS = re.compile(
    r"\b(the|and|you|your|that|with|this|for|from|have|what|when|because|just|about|it's|don't)\b",
    re.IGNORECASE,
)

NUMBER_WORDS = {
    "de": (
        "null", "eins", "erste", "ersten", "erster", "zweite", "zweiten", "zweiter",
        "dritte", "dritten", "dritter", "vierte", "vierten", "fünfte", "fuenfte",
        "zwei", "drei", "vier", "fünf", "fuenf", "sechs", "sieben", "acht", "neun",
        "zehn", "elf", "zwölf", "zwoelf", "dreizehn", "vierzehn", "fünfzehn", "fuenfzehn",
        "zwanzig", "dreißig", "dreissig", "vierzig", "fünfzig", "fuenfzig",
        "sechzig", "siebzig", "achtzig", "neunzig", "hundert", "tausend",
        "million", "millionen",
    ),
    "en": (
        "zero", "one", "first", "second", "third", "fourth", "fifth",
        "two", "three", "four", "five", "six", "seven",
        "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
        "fifteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
        "eighty", "ninety", "hundred", "thousand", "million", "billion",
    ),
}

DIGIT_RE = re.compile(r"(?<![\w#])(?:[$€£]\s?)?\d+(?:[.,]\d+)?%?")
HANDLE_RE = re.compile(r"@[A-Za-z0-9._]{2,}")
QUOTE_RE = re.compile(r"[\"«][^\"»]{2,40}[\"»]")
NAME_RE = re.compile(r"\b[A-ZÄÖÜ][a-zäöüß]{2,}\b")
NAME_SKIP = {
    "The", "And", "But", "For", "With", "This", "That", "From", "Your", "You",
    "Ich", "Und", "Der", "Die", "Das", "Ein", "Eine", "Mit", "Für", "Auf",
    "Aber", "Wenn", "Nach", "Beim", "Zum", "Zur", "Vom", "Nicht", "Auch",
    "Here", "There", "What", "When", "Then", "This", "Hier", "Dann", "Wenn",
    "Nobody", "Everyone", "Someone", "Before", "After", "Because",
}

STOPWORDS = {
    "the", "and", "but", "for", "with", "this", "that", "from", "your", "you",
    "ich", "und", "der", "die", "das", "ein", "eine", "mit", "für", "auf",
    "aber", "wenn", "nach", "beim", "zum", "zur", "vom", "nicht", "auch",
    "here", "there", "what", "when", "then", "hier", "dann", "weil", "oder",
    "ist", "sind", "war", "haben", "hat", "have", "was", "were", "are", "is",
    "ein", "einen", "einem", "einer", "dem", "den", "des", "into", "about",
    "just", "this", "that", "they", "them", "their", "wir", "ihr", "euch",
}


def load_json(name: str) -> dict:
    return json.loads((LIB / name).read_text(encoding="utf-8"))


def platform() -> dict:
    return load_json("platform.json")


def detect_lang(text: str) -> str:
    if re.search(r"[äöüÄÖÜß]", text):
        return "de"
    de = len(DE_HINTS.findall(text))
    en = len(EN_HINTS.findall(text))
    if de > en:
        return "de"
    return "en"


def resolve_lang(text: str, lang: str | None) -> str:
    if lang in ("de", "en"):
        return lang
    return detect_lang(text)


def words(text: str) -> list[str]:
    return re.findall(r"[A-Za-zÄÖÜäöüß0-9$€£%']+", text)


def concrete_markers(text: str, lang: str | None = None) -> list[str]:
    lang = resolve_lang(text, lang)
    found: list[str] = []
    found.extend(DIGIT_RE.findall(text))
    found.extend(HANDLE_RE.findall(text))
    found.extend(QUOTE_RE.findall(text))
    vocab = set(NUMBER_WORDS["de"]) | set(NUMBER_WORDS["en"])
    for token in words(text):
        if token.lower() in vocab:
            found.append(token.lower())
    if lang == "en":
        for name in NAME_RE.findall(text):
            if text.lstrip().startswith(name):
                continue
            if name in NAME_SKIP:
                continue
            found.append(name)
    return found


def content_tokens(text: str) -> list[str]:
    out = []
    for token in words(text):
        low = token.lower()
        if len(low) >= 5 and low not in STOPWORDS and not low.isdigit():
            out.append(low)
    return out


def strip_invisible(text: str) -> tuple[str, int]:
    count = 0
    chars: list[str] = []
    for char in text:
        if char in INVISIBLE_DELETE or TAG_RE.match(char):
            count += 1
            continue
        if unicodedata.category(char) == "Cf":
            count += 1
            continue
        if char in INVISIBLE_TO_SPACE:
            count += 1
            chars.append(" ")
            continue
        chars.append(char)
    return "".join(chars), count


def fix_typography(text: str) -> tuple[str, list[dict]]:
    changes: list[dict] = []

    def swap(pattern: str, repl: str, label: str, source: str) -> None:
        nonlocal text
        hits = len(re.findall(pattern, text))
        if not hits:
            return
        text = re.sub(pattern, repl, text)
        changes.append({"kind": "typography", "from": source, "to": label, "count": hits})

    swap(r"\s*—\s*|\s*―\s*", ", ", ",", "em dash")
    swap(r"\s*–\s*", "-", "-", "en dash")
    swap(r"…", "...", "...", "ellipsis")
    swap(r"[“”]", '"', '"', "curly quote")
    swap(r"[‘’]", "'", "'", "curly apostrophe")
    text = re.sub(r",\s*,+", ", ", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r" +([,.;:!?])", r"\1", text)
    return text.strip(), changes


def cleanup_whitespace(text: str) -> str:
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r" +([,.;:!?])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    text = re.sub(r"(^|[.!?]\s+),\s*", r"\1", text)
    text = re.sub(r"\s+([.!?])", r"\1", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def apply_replacements(text: str, replacements: list[dict]) -> tuple[str, list[dict]]:
    changes: list[dict] = []
    ordered = sorted(replacements, key=lambda item: len(item.get("from", "")), reverse=True)
    for item in ordered:
        source = item.get("from", "").strip()
        target = item.get("to", "")
        if not source:
            continue
        pattern = re.compile(rf"\b{re.escape(source)}\b", re.IGNORECASE)

        def repl(match: re.Match, target: str = target) -> str:
            found = match.group(0)
            if not target:
                return ""
            if found[:1].isupper():
                return target[:1].upper() + target[1:]
            return target

        updated, count = pattern.subn(repl, text)
        if count:
            changes.append({"kind": "lexicon", "from": source, "to": target, "count": count})
            text = updated
    return cleanup_whitespace(text), changes


def read_input(path: str | None) -> str:
    if not path or path == "-":
        import sys
        return sys.stdin.read()
    return Path(path).read_text(encoding="utf-8")


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [part.strip() for part in parts if part.strip()]
