"""Pydantic settings for project configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""

    default_model: str = "gemini-2.5-flash"
    max_tokens: int = 64000

    max_design_iterations: int = 3
    max_code_iterations: int = 2

    output_dir: str = "output"
    chroma_db_dir: str = "data/chroma_db"

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
