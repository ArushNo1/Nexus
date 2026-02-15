"""Image generation wrapper for game sprites and backgrounds."""

import base64
from langchain.tools import tool


@tool
def generate_sprite(description: str, size: str = "64x64") -> str:
    """Generate a game sprite from a text description.

    Returns a base64-encoded data URI for embedding in the HTML game.
    """
    # TODO: Integrate DALL-E 3 or Stable Diffusion API
    # For now, return a placeholder SVG as base64
    w, h = size.split("x")
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">'
        f'<rect width="{w}" height="{h}" fill="#666"/>'
        f'<text x="50%" y="50%" text-anchor="middle" dy=".3em" '
        f'fill="white" font-size="10">{description[:12]}</text></svg>'
    )
    encoded = base64.b64encode(svg.encode()).decode()
    return f"data:image/svg+xml;base64,{encoded}"
