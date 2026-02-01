from __future__ import annotations

from pathlib import Path

from .loader import PromptLoader


def build_core_prompt(root: Path) -> str:
    loader = PromptLoader(root)
    system, guardian, output_format = loader.load_core()
    sections = [
        "# System Prompt",
        system,
        "# Guardian Prompt",
        guardian,
        "# Output Format",
        output_format,
    ]
    return "\n\n".join(sections)
