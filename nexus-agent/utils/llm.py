"""LLM client factory — routes each node to the appropriate Gemini model."""

from langchain_google_genai import ChatGoogleGenerativeAI

from utils.config import settings

MODEL_MAP: dict[str, str] = {
    "game_planner": "gemini-3-flash-preview",
    "design_evaluator": "gemini-3-flash-preview",
    "implementation_planner": "gemini-3-flash-preview",
    "game_coder": "gemini-3-pro-preview",
    "game_player": "gemini-3-flash-preview",
}


def extract_text(content) -> str:
    """Normalize LLM response content to a plain string.

    Gemini models may return a list of content blocks instead of a string.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            block if isinstance(block, str) else block.get("text", "")
            for block in content
        )
    return str(content)


def get_llm(node_name: str) -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI client configured for the given node."""
    model = MODEL_MAP.get(node_name, settings.default_model)
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=settings.gemini_api_key or None,
        max_output_tokens=settings.max_tokens,
    )
