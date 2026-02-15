"""Supabase client for updating game status in the games table."""

import os
from supabase import create_client, Client
from utils.logger import get_logger

log = get_logger("supabase")

_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create a Supabase client using the service role key."""
    global _client
    if _client is None:
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(url, key)
    return _client


def update_game(game_id: str, data: dict) -> None:
    """Update a row in the games table by ID.

    Args:
        game_id: UUID of the game row.
        data: Dict of column names to values to update.
    """
    client = get_supabase_client()
    log.info(f"[blue]Supabase[/blue] | updating game {game_id}: {list(data.keys())}")
    client.table("games").update(data).eq("id", game_id).execute()
