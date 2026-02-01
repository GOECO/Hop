from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LLMRequest:
    system: str
    user: str


class DummyLLM:
    def generate(self, request: LLMRequest) -> str:
        return "\n\n".join([request.system, request.user])
