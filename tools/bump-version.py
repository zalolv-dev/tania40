#!/usr/bin/env python3
"""Pon ?v=VERSION en todas as referencias a JS/CSS locais (index.html e imports).

Así, cada vez que se publica, os móbiles descargan todos os ficheiros novos
e nunca mesturan versións antigas e novas (GitHub Pages garda caché 10 min).

Uso (desde a carpeta do proxecto):  python3 tools/bump-version.py
"""
import pathlib
import re
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
version = time.strftime("%Y%m%d%H%M%S")

IMPORT_RE = re.compile(r'(from\s+"(?:\./|\.\./)[\w/.-]+?\.js)(?:\?v=\w+)?(")')
DYN_RE = re.compile(r'(import\(\s*"(?:\./|\.\./)[\w/.-]+?\.js)(?:\?v=\w+)?(")')

changed = 0
for path in (ROOT / "js").rglob("*.js"):
    text = path.read_text(encoding="utf-8")
    new = IMPORT_RE.sub(rf"\1?v={version}\2", text)
    new = DYN_RE.sub(rf"\1?v={version}\2", new)
    if new != text:
        path.write_text(new, encoding="utf-8")
        changed += 1

index = ROOT / "index.html"
html = index.read_text(encoding="utf-8")
html = re.sub(r'((?:href|src)="(?:css|js|vendor)/[\w/.-]+?\.(?:css|js))(?:\?v=\w+)?(")', rf"\1?v={version}\2", html)
index.write_text(html, encoding="utf-8")

print(f"Versión {version} aplicada ({changed} ficheiros JS + index.html)")
