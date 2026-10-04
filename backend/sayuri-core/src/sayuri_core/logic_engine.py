from __future__ import annotations

from typing import Any


class LogicEngine:
    """Thin Sayuri-owned adapter around Hyperon/MeTTa."""

    def __init__(self) -> None:
        from hyperon import MeTTa

        self._metta = MeTTa()

    @staticmethod
    def _normalise(value: Any) -> Any:
        if isinstance(value, list):
            return [LogicEngine._normalise(item) for item in value]
        return str(value)

    def run(self, metta_code: str) -> list[Any]:
        if not metta_code or not metta_code.strip():
            raise ValueError("MeTTa code must not be empty")
        return self._normalise(self._metta.run(metta_code))

    def health(self) -> dict[str, Any]:
        try:
            result = self.run("!(+ 1 1)")
            return {"available": True, "engine": "hyperon", "probe": result}
        except Exception as exc:  # pragma: no cover - diagnostic boundary
            return {
                "available": False,
                "engine": "hyperon",
                "error": f"{type(exc).__name__}: {exc}",
            }
