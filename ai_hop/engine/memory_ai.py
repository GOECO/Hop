from __future__ import annotations

from pathlib import Path
from typing import Any

from .utils import append_jsonl, read_json, write_json


class MemoryStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.memory_path = root / "memory" / "memory.json"
        self.decisions_path = root / "memory" / "decisions_log.jsonl"

    def load(self) -> dict[str, Any]:
        return read_json(self.memory_path)

    def save(self, payload: dict[str, Any]) -> None:
        write_json(self.memory_path, payload)

    def log_decision(self, payload: dict[str, Any]) -> None:
        append_jsonl(self.decisions_path, payload)
