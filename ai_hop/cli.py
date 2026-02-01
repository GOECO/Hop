from __future__ import annotations

import argparse
from pathlib import Path

from engine.core_ai import build_core_prompt
from engine.project_ai import build_project_prompt
from engine.loader import PromptLoader


def build_full_prompt(root: Path, project: str) -> str:
    loader = PromptLoader(root)
    bundle = loader.load_bundle(project)
    sections = [
        "# System Prompt",
        bundle.system,
        "# Guardian Prompt",
        bundle.guardian,
        "# Output Format",
        bundle.output_format,
        "# Project Prompt",
        bundle.project_prompt,
        "# Project Scope",
        bundle.project_scope,
        "# Project Knowledge",
        bundle.project_knowledge,
    ]
    return "\n\n".join(sections)


def main() -> None:
    parser = argparse.ArgumentParser(description="Hop AI prompt helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser("build", help="Build full prompt bundle")
    build_parser.add_argument("--project", default="goeco")

    core_parser = subparsers.add_parser("core", help="Show core prompt bundle")
    core_parser.add_argument("--project", default="goeco")

    project_parser = subparsers.add_parser("project", help="Show project prompt bundle")
    project_parser.add_argument("--project", default="goeco")

    args = parser.parse_args()
    root = Path(__file__).resolve().parent

    if args.command == "build":
        output = build_full_prompt(root, args.project)
    elif args.command == "core":
        output = build_core_prompt(root)
    else:
        output = build_project_prompt(root, args.project)

    print(output)


if __name__ == "__main__":
    main()
