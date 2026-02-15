"""Prompt template loading and rendering via Jinja2."""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

_env = Environment(
    loader=FileSystemLoader(str(PROMPTS_DIR)),
    keep_trailing_newline=True,
)


def load_prompt(filename: str) -> str:
    """Load a raw prompt file from the prompts/ directory."""
    filepath = PROMPTS_DIR / filename
    return filepath.read_text()


def render_template(filename: str, variables: dict) -> str:
    """Render a Jinja2 prompt template with the given variables."""
    template = _env.get_template(filename)
    return template.render(**variables)
