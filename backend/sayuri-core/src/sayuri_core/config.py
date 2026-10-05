from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SAYURI_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    host: str = "127.0.0.1"
    port: int = 8765
    data_dir: str = "./data"
    enable_logic: bool = True
    enable_evolution: bool = True
    enable_learning: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
