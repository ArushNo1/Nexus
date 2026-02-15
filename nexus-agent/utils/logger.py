"""Structured logging for each pipeline node."""

import logging

from rich.logging import RichHandler


def get_logger(node_name: str) -> logging.Logger:
    """Return a logger configured with Rich formatting for the given node."""
    logger = logging.getLogger(f"nexus.{node_name}")
    if not logger.handlers:
        handler = RichHandler(markup=True, show_path=False)
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
