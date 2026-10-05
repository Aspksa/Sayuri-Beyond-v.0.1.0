from functools import lru_cache

from pydantic import SecretStr
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

    # Provider-neutral LLM bridge. "mock" keeps local development and CI key-free.
    llm_provider: str = "mock"
    llm_base_url: str = ""
    llm_api_key: SecretStr | None = None
    llm_model: str = ""
    llm_timeout_seconds: float = 60.0
    llm_temperature: float = 0.2

    # Browser UI stays local by default.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # JSON metadata only in v0.2. Execution of arbitrary MCP commands is disabled.
    mcp_servers_json: str = "[]"

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
