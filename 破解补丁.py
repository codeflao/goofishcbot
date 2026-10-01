#!/usr/bin/env python3
"""Fail-closed derived-file patcher for Node.js license startup gates.

The tool never overwrites the source tree. It only emits a patched copy and
metadata into --output after locating exactly one supported authorization gate.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

FUNC_PATTERN = re.compile(
    r"(?:verify|check|validate)(?:[A-Z][A-Za-z0-9_$]*)?", re.IGNORECASE
)
CALL_AND_BRACED_GATE = re.compile(
    r"(?P<start>\b(?:const|let|var)\s+(?P<var>[A-Za-z_$][\w$]*)\s*=\s*"
    r"await\s+(?P<func>[A-Za-z_$][\w$]*)\s*\([^;]*?\)\s*;\s*"
    r"if\s*\(\s*!\s*(?P=var)\s*\.\s*valid\s*\)\s*)\{",
    re.IGNORECASE | re.DOTALL,
)
CALL_AND_SINGLE_EXIT = re.compile(
    r"(?P<start>\b(?:const|let|var)\s+(?P<var>[A-Za-z_$][\w$]*)\s*=\s*"
    r"await\s+(?P<func>[A-Za-z_$][\w$]*)\s*\([^;]*?\)\s*;\s*"
    r"if\s*\(\s*!\s*(?P=var)\s*\.\s*valid\s*\)\s*)"
    r"(?P<exit>process\.exit\s*\([^;]*?\)\s*;|throw\s+[^;]+;|return\s+[^;]+;)",
    re.IGNORECASE | re.DOTALL,
)
LICENSE_CONTEXT = re.compile(
    r"license|licence|activation|activate|card(?:key)?|authKey|AUTH_SERVER|"
    r"license\.key|授权|卡密",
    re.IGNORECASE,
)
TERMINAL_BRANCH = re.compile(r"process\.exit\s*\(|\bthrow\b|\breturn\b", re.IGNORECASE)


@dataclass
class Candidate:
    start: int
    end: int
    variable: str
    function: str
    pattern: str
    source_branch: str


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def find_closing_brace(text: str, open_brace: int) -> int:
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    index = open_brace
    while index < len(text):
        char = text[index]
        nxt = text[index + 1] if index + 1 < len(text) else ""
        if line_comment:
            if char in "\r\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            if char == "*" and nxt == "/":
                block_comment = False
                index += 2
                continue
            index += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            index += 1
            continue
        if char == "/" and nxt == "/":
            line_comment = True
            index += 2
            continue
        if char == "/" and nxt == "*":
            block_comment = True
            index += 2
            continue
        if char in "'\"`":
            quote = char
            index += 1
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    raise ValueError("unclosed authorization branch")


def is_license_candidate(text: str, match: re.Match[str]) -> bool:
    function = match.group("func")
    function_is_specific = bool(re.search(r"license|licence|activation|card|key", function, re.IGNORECASE))
    nearby = text[max(0, match.start() - 12000): min(len(text), match.end() + 12000)]
    return bool(FUNC_PATTERN.fullmatch(function)) and (function_is_specific or bool(LICENSE_CONTEXT.search(nearby)))


def locate_candidates(text: str) -> list[Candidate]:
    candidates: list[Candidate] = []
    for match in CALL_AND_BRACED_GATE.finditer(text):
        if not is_license_candidate(text, match):
            continue
        open_brace = text.find("{", match.start("start") + len(match.group("start")))
        close_brace = find_closing_brace(text, open_brace)
        branch = text[match.start(): close_brace + 1]
        if TERMINAL_BRANCH.search(branch):
            candidates.append(Candidate(match.start(), close_brace + 1, match.group("var"), match.group("func"), "braced", branch))
    for match in CALL_AND_SINGLE_EXIT.finditer(text):
        if not is_license_candidate(text, match):
            continue
        branch = text[match.start(): match.end()]
        candidates.append(Candidate(match.start(), match.end(), match.group("var"), match.group("func"), "single-statement", branch))
    return candidates


def byte_offset(text: str, char_offset: int) -> int:
    return len(text[:char_offset].encode("utf-8"))


def find_node(source_root: Path) -> str | None:
    bundled = source_root / "node.exe"
    if bundled.is_file():
        return str(bundled)
    return shutil.which("node")


def patch_file(source_file: Path, source_root: Path, output_root: Path, node: str | None) -> dict:
    source = source_file.read_text(encoding="utf-8")
    candidates = locate_candidates(source)
    if len(candidates) != 1:
        raise RuntimeError(f"{source_file}: expected exactly one supported card-license gate, found {len(candidates)}")
    candidate = candidates[0]
    replacement = (
        f'const {candidate.variable}={{valid:true,message:"Local authorization enabled",'
        'expireDate:"",daysRemaining:0};'
    )
    patched = source[:candidate.start] + replacement + source[candidate.end:]
    relative = source_file.relative_to(source_root)
    destination = output_root / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(patched, encoding="utf-8")
    syntax = {"checked": False, "passed": None, "command": None, "stdout": "", "stderr": ""}
    if node:
        completed = subprocess.run([node, "--check", str(destination)], capture_output=True, text=True, check=False)
        syntax = {
            "checked": True,
            "passed": completed.returncode == 0,
            "command": [node, "--check", str(destination)],
            "stdout": completed.stdout,
            "stderr": completed.stderr,
        }
        if not syntax["passed"]:
            raise RuntimeError(f"Node syntax check failed for {destination}: {completed.stderr.strip()}")
    return {
        "source": str(relative).replace("\\", "/"),
        "destination": str(relative).replace("\\", "/"),
        "sourceSha256": sha256_text(source),
        "patchedSha256": sha256_text(patched),
        "sourceBranchByteOffset": byte_offset(source, candidate.start),
        "replacedSourceBytes": len(candidate.source_branch.encode("utf-8")),
        "authorizationFunction": candidate.function,
        "resultVariable": candidate.variable,
        "pattern": candidate.pattern,
        "replacement": replacement,
        "syntax": syntax,
    }


def run_patch(source_root: Path, output_root: Path, explicit_file: Path | None) -> dict:
    source_root = source_root.resolve()
    output_root = output_root.resolve()
    if source_root == output_root:
        raise RuntimeError("--output must be different from --source")
    source_file = explicit_file.resolve() if explicit_file else source_root / "app" / "index.js"
    if not source_file.is_file() or source_root not in source_file.parents:
        raise RuntimeError("target file must exist under --source")
    node = find_node(source_root)
    result = patch_file(source_file, source_root, output_root, node)
    metadata = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceRoot": str(source_root),
        "outputRoot": str(output_root),
        "behavior": "Derived file replaces exactly one recognized startup card-license failure gate. Source files are never overwritten.",
        "patch": result,
    }
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "PATCH_METADATA.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    return metadata


def self_test(output_root: Path) -> dict:
    fixtures = {
        "braced": (
            'const AUTH_SERVER_URL="http://example.invalid/verify";'
            'async function verifyLicense(){return{valid:false}}'
            'async function main(){const result=await verifyLicense();'
            'if(!result.valid){console.error("invalid");process.exit(1)}return result.message}',
            "await verifyLicense()",
        ),
        "single-statement": (
            'const AUTH_SERVER_URL="http://example.invalid/verify";'
            'async function checkLicense(){return{valid:false}}'
            'async function main(){const result=await checkLicense();'
            'if(!result.valid) process.exit(1);return result.message}',
            "await checkLicense()",
        ),
    }
    cases = []
    for name, (fixture, removed_call) in fixtures.items():
        fixture_root = output_root / f"fixture-{name}-source"
        fixture_file = fixture_root / "app" / "index.js"
        fixture_file.parent.mkdir(parents=True, exist_ok=True)
        fixture_file.write_text(fixture, encoding="utf-8")
        patched_root = output_root / f"fixture-{name}-patched"
        metadata = run_patch(fixture_root, patched_root, None)
        patched = (patched_root / "app" / "index.js").read_text(encoding="utf-8")
        assert removed_call not in patched
        assert "Local authorization enabled" in patched
        assert "process.exit(1)" not in patched
        cases.append({"name": name, "pattern": metadata["patch"]["pattern"], "status": "passed"})

    ambiguous_root = output_root / "fixture-ambiguous-source"
    ambiguous_file = ambiguous_root / "app" / "index.js"
    ambiguous_file.parent.mkdir(parents=True, exist_ok=True)
    ambiguous_file.write_text(
        'const AUTH_SERVER_URL="http://example.invalid/verify";'
        'async function verifyLicense(){return{valid:false}}'
        'async function one(){const a=await verifyLicense();if(!a.valid){process.exit(1)}}'
        'async function two(){const b=await verifyLicense();if(!b.valid){process.exit(1)}}',
        encoding="utf-8",
    )
    ambiguous_output = output_root / "fixture-ambiguous-patched"
    try:
        run_patch(ambiguous_root, ambiguous_output, None)
    except RuntimeError as error:
        assert "expected exactly one supported card-license gate, found 2" in str(error)
    else:
        raise AssertionError("ambiguous source was not rejected")
    assert not (ambiguous_output / "app" / "index.js").exists()
    cases.append({"name": "ambiguous", "status": "rejected-without-output"})
    return {"selfTest": "passed", "cases": cases}

def main() -> int:
    parser = argparse.ArgumentParser(description="Fail-closed derived patcher for recognized Node.js card-license startup gates.")
    parser.add_argument("--source", type=Path, help="Release root to scan; never modified.")
    parser.add_argument("--output", type=Path, required=True, help="Output root for only derived files.")
    parser.add_argument("--file", type=Path, help="Optional target JS file under --source; default: app/index.js")
    parser.add_argument("--self-test", action="store_true", help="Run a synthetic fixture test under --output.")
    args = parser.parse_args()
    try:
        result = self_test(args.output) if args.self_test else run_patch(args.source, args.output, args.file)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
