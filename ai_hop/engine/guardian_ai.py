from __future__ import annotations

from pathlib import Path

from .loader import PromptLoader


def build_guardian_prompt(root: Path) -> str:
    loader = PromptLoader(root)
    _, guardian, _ = loader.load_core()
    return guardian
