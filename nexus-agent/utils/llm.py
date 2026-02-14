"""LLM client factory — routes each node to the appropriate Gemini model."""

from langchain_google_genai import ChatGoogleGenerativeAI

from utils.config import settings

MODEL_MAP: dict[str, str] = {
    "game_planner": "gemini-2.5-flash",
    "design_evaluator": "gemini-2.5-flash",
    "game_coder": "gemini-2.5-pro",
    "asset_generator": "gemini-2.5-flash",
    "game_player": "gemini-2.5-flash",
}


def get_llm(node_name: str) -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI client configured for the given node."""
    model = MODEL_MAP.get(node_name, settings.default_model)
    return ChatGoogleGenerativeAI(model=model, max_output_tokens=settings.max_tokens)
