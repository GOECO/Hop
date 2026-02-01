from __future__ import annotations

from pathlib import Path

from .loader import PromptLoader


def build_project_prompt(root: Path, project: str) -> str:
    loader = PromptLoader(root)
    prompt, scope, knowledge = loader.load_project(project)
    sections = [
        "# Project Prompt",
        prompt,
        "# Project Scope",
        scope,
        "# Project Knowledge",
        knowledge,
    ]
    return "\n\n".join(sections)
