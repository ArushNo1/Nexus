"""Convert external assets to base64 data URIs for embedding in HTML."""

import base64
from pathlib import Path

from langchain.tools import tool


@tool
def embed_asset_as_base64(file_path: str) -> str:
    """Convert a file to a base64 data URI string for inline embedding."""
    path = Path(file_path)
    if not path.exists():
        return f"Error: File not found: {file_path}"

    mime_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".gif": "image/gif",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
    }

    mime = mime_types.get(path.suffix.lower(), "application/octet-stream")
    data = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{data}"
