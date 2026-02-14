"""Pydantic settings for project configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_api_key: str = ""

    default_model: str = "gemini-2.5-flash"
    max_tokens: int = 8192

    max_design_iterations: int = 3
    max_code_iterations: int = 2

    output_dir: str = "output"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
