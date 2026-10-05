from __future__ import annotations

import time
from typing import Any
from urllib.parse import urlparse

import httpx

from .config import Settings


class LLMRuntimeBridge:
    """Provider-neutral bridge. API keys never cross into the frontend."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def status(self) -> dict[str, Any]:
        provider = self.settings.llm_provider.strip().casefold() or "mock"
        configured = provider == "mock" or bool(
            self.settings.llm_base_url
            and self.settings.llm_model
            and self.settings.llm_api_key
        )
        return {
            "available": configured,
            "provider": provider,
            "model": self.settings.llm_model or ("sayuri-mock" if provider == "mock" else None),
            "configured": configured,
            "api_key_present": bool(self.settings.llm_api_key),
            "base_url_present": bool(self.settings.llm_base_url),
            "streaming": False,
            "mode": "mock" if provider == "mock" else "openai-compatible",
        }

    @staticmethod
    def _chat_url(base_url: str) -> str:
        clean = base_url.strip().rstrip("/")
        parsed = urlparse(clean)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise RuntimeError("LLM base URL must be an absolute http(s) URL")
        if parsed.scheme == "http" and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
            raise RuntimeError("Non-local LLM endpoints must use HTTPS")
        if clean.endswith("/chat/completions"):
            return clean
        return clean + "/chat/completions"

    def generate(self, messages: list[dict[str, str]]) -> dict[str, Any]:
        provider = self.settings.llm_provider.strip().casefold() or "mock"
        started = time.perf_counter()

        if provider == "mock":
            user_message = next(
                (
                    item.get("content", "")
                    for item in reversed(messages)
                    if item.get("role") == "user"
                ),
                "",
            )
            content = (
                "SAYURI Core v0.2 работает в безопасном mock-режиме. "
                "Когнитивный цикл, память, контекст экрана и проверка уже подключены. "
                "Для настоящего ответа подключите OpenAI-compatible провайдера в "
                "backend/sayuri-core/.env. "
                f"Получен запрос: {user_message[:240]}"
            )
            return {
                "content": content,
                "provider": "mock",
                "model": "sayuri-mock",
                "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
                "usage": None,
            }

        if not (
            self.settings.llm_base_url
            and self.settings.llm_model
            and self.settings.llm_api_key
        ):
            raise RuntimeError(
                "LLM provider is selected but base URL, model or API key is missing"
            )

        url = self._chat_url(self.settings.llm_base_url)
        key = self.settings.llm_api_key.get_secret_value()
        payload = {
            "model": self.settings.llm_model,
            "messages": messages,
            "temperature": self.settings.llm_temperature,
            "stream": False,
        }

        try:
            with httpx.Client(timeout=self.settings.llm_timeout_seconds) as client:
                response = client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                body = response.json()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"LLM provider returned HTTP {exc.response.status_code}"
            ) from exc
        except httpx.HTTPError as exc:
            raise RuntimeError(f"LLM provider request failed: {type(exc).__name__}") from exc

        try:
            content = body["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError("LLM provider returned an unsupported response shape") from exc

        if not isinstance(content, str) or not content.strip():
            raise RuntimeError("LLM provider returned an empty answer")

        return {
            "content": content.strip(),
            "provider": provider,
            "model": self.settings.llm_model,
            "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
            "usage": body.get("usage"),
        }
