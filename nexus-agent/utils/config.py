"""Pydantic settings for project configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""

    default_model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 8192

    max_design_iterations: int = 3
    max_code_iterations: int = 2

    output_dir: str = "output"

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"


settings = Settings()
