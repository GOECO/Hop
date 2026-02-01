from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .utils import read_text


@dataclass(frozen=True)
class PromptBundle:
    system: str
    guardian: str
    output_format: str
    project_prompt: str
    project_scope: str
    project_knowledge: str


class PromptLoader:
    def __init__(self, root: Path) -> None:
        self.root = root

    def load_core(self) -> tuple[str, str, str]:
        core_dir = self.root / "core"
        system = read_text(core_dir / "system_prompt.txt").strip()
        guardian = read_text(core_dir / "guardian_prompt.txt").strip()
        output_format = read_text(core_dir / "output_format.md").strip()
        return system, guardian, output_format

    def load_project(self, name: str) -> tuple[str, str, str]:
        project_dir = self.root / "projects" / name
        prompt = read_text(project_dir / "prompt.txt").strip()
        scope = read_text(project_dir / "scope.md").strip()
        knowledge = read_text(project_dir / "knowledge.md").strip()
        return prompt, scope, knowledge

    def load_bundle(self, project: str) -> PromptBundle:
        system, guardian, output_format = self.load_core()
        prompt, scope, knowledge = self.load_project(project)
        return PromptBundle(
            system=system,
            guardian=guardian,
            output_format=output_format,
            project_prompt=prompt,
            project_scope=scope,
            project_knowledge=knowledge,
        )
