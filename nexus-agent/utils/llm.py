"""LLM client factory — routes each node to the appropriate Claude model."""

from langchain_anthropic import ChatAnthropic

from utils.config import settings

MODEL_MAP: dict[str, str] = {
    "game_planner": "claude-sonnet-4-20250514",
    "design_evaluator": "claude-sonnet-4-20250514",
    "game_coder": "claude-sonnet-4-20250514",
    "asset_generator": "claude-sonnet-4-20250514",
    "game_player": "claude-sonnet-4-20250514",
}


def get_llm(node_name: str) -> ChatAnthropic:
    """Return a ChatAnthropic client configured for the given node."""
    model = MODEL_MAP.get(node_name, settings.default_model)
    return ChatAnthropic(model=model, max_tokens=settings.max_tokens)
