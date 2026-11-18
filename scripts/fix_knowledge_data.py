"""Comprehensive knowledge JSON fixer.
Undoes damage from over-aggressive quote replacement, then fixes only
embedded ASCII double quotes inside Chinese text contexts.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Keys that were damaged by the broken fix script
CURLY_LEFT = "“"   # "
CURLY_RIGHT = "”"  # "

def restore_json_quotes(text: str) -> str:
    """Convert ALL curly double quotes back to ASCII double quotes."""
    # Replace left curly quote with ASCII
    text = text.replace(CURLY_LEFT, '"')
    # Replace right curly quote with ASCII
    text = text.replace(CURLY_RIGHT, '"')
    return text


def escape_embedded_quotes(text: str) -> str:
    """Escape ASCII double quotes that appear inside Chinese text contexts.
    These are patterns like: 先生"五方五佛"之论
    where the ASCII quotes are used as Chinese-style quotation marks.
    We replace them with Chinese curly quotes.
    """
    # Pattern: an ASCII " followed by Chinese chars then another ASCII "
    # Only applies when the quotes are BETWEEN Chinese characters (not at JSON boundaries)
    # We use the heuristic: quote preceded by CJK char, followed by CJK content, then quote
    result = []
    i = 0
    while i < len(text):
        if text[i] == '"' and i > 0 and i < len(text) - 2:
            # Check if this is an embedded Chinese-context quote
            prev_char = text[i-1]
            # Look ahead: is there another " quote within 40 chars, followed by CJK?
            rest = text[i+1:i+50]
            end_match = re.match(r'([一-鿿\w\s,，。！？、：；（）《》【】\-+/]{1,40})"', rest)
            if end_match and _is_cjk(prev_char):
                inner = end_match.group(1)
                after_idx = i + 1 + len(inner) + 1
                if after_idx < len(text) and _is_cjk(text[after_idx]):
                    # This is an embedded quote pair - use curly quotes
                    result.append(CURLY_LEFT + inner + CURLY_RIGHT)
                    i = after_idx
                    continue
        result.append(text[i])
        i += 1
    return "".join(result)


def _is_cjk(ch: str) -> bool:
    """Check if character is CJK or CJK-compatible."""
    cp = ord(ch)
    return (0x4E00 <= cp <= 0x9FFF or   # CJK Unified
            0x3400 <= cp <= 0x4DBF or   # CJK Extended A
            0x3000 <= cp <= 0x303F or   # CJK Symbols
            0xFF00 <= cp <= 0xFFEF or   # Halfwidth/Fullwidth
            0x2000 <= cp <= 0x206F)     # General Punctuation


def fix_file(filepath: Path):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Step 1: Restore all curly quotes to ASCII (undo previous damage)
    restored = restore_json_quotes(content)

    # Step 2: Try to parse as valid JSON
    try:
        json.loads(restored)
        # Already valid - this is a file the fix script didn't touch
        print(f"OK  {filepath.name} (already valid)")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(restored)
        return
    except json.JSONDecodeError:
        pass

    # Step 3: The file has embedded ASCII quotes - fix them surgically
    fixed = escape_embedded_quotes(restored)

    # Step 4: Validate
    try:
        json.loads(fixed)
        print(f"OK  {filepath.name} (fixed {_count_diff(restored, fixed)} embedded quotes)")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(fixed)
    except json.JSONDecodeError as e:
        print(f"FAIL {filepath.name} at line {e.lineno}, col {e.colno}")
        pos = e.pos
        print(f"  Context: {repr(fixed[max(0,pos-40):pos+40])}")
        # Save the best attempt anyway
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(fixed)


def _count_diff(orig: str, fixed: str) -> int:
    """Count how many quote pairs were fixed."""
    orig_count = orig.count('"')
    fixed_count = fixed.count('"')
    return (orig_count - fixed_count) // 2


if __name__ == "__main__":
    files = [
        "src/data/knowledge-spots.json",
        "src/data/knowledge-history.json",
        "src/data/knowledge-routes.json",
        "src/data/knowledge-faq.json",
    ]
    for rel in files:
        fp = ROOT / rel
        if fp.exists():
            fix_file(fp)
        else:
            print(f"SKIP {rel} (not found)")
