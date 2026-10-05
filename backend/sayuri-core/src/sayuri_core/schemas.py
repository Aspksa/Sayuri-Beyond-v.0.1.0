from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class LogicRequest(BaseModel):
    code: str = Field(min_length=1, max_length=20_000)


class ScoreVector(BaseModel):
    accuracy: float = Field(ge=0, le=1)
    reasoning: float = Field(ge=0, le=1)
    memory_use: float = Field(ge=0, le=1)
    tool_use: float = Field(ge=0, le=1)
    efficiency: float = Field(ge=0, le=1)
    consistency: float = Field(ge=0, le=1)
    user_acceptance: float | None = Field(default=None, ge=0, le=1)


class LearningCycleRequest(BaseModel):
    task_type: str = Field(min_length=1, max_length=120)
    strategy_key: str = Field(min_length=1, max_length=120)
    outcome: str = Field(min_length=1, max_length=20_000)
    scores: ScoreVector
    errors: list[str] = Field(default_factory=list)
    observed_lessons: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    retrieved_memory_ids: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.5, ge=0, le=1)


class StrategyCandidateRequest(BaseModel):
    strategy_key: str = Field(min_length=1, max_length=120)
    version: int = Field(ge=1)
    description: str = Field(min_length=1, max_length=10_000)
    score: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    regression_passed: bool = False
    safety_passed: bool = False


class StrategyRollbackRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=2_000)


class EvolutionProposalRequest(BaseModel):
    strategy_key: str = Field(min_length=1, max_length=120)
    base_description: str = Field(min_length=1, max_length=10_000)
    lessons: list[str] = Field(default_factory=list)
    variants: int = Field(default=4, ge=2, le=4)


class EvolutionBenchmarkCandidate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=10_000)
    scores: ScoreVector
    confidence: float = Field(ge=0, le=1)
    regression_passed: bool = False
    safety_passed: bool = False


class EvolutionBenchmarkRequest(BaseModel):
    strategy_key: str = Field(min_length=1, max_length=120)
    baseline_score: float = Field(ge=0, le=1)
    candidates: list[EvolutionBenchmarkCandidate] = Field(min_length=1, max_length=8)


class FactCreateRequest(BaseModel):
    entity: str = Field(min_length=1, max_length=200)
    attribute: str = Field(min_length=1, max_length=200)
    value: str = Field(min_length=1, max_length=5_000)
    confidence: float = Field(ge=0, le=1)
    source: str = Field(min_length=1, max_length=2_000)


class HypothesisCreateRequest(BaseModel):
    statement: str = Field(min_length=1, max_length=10_000)
    evidence: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


class HypothesisUpdateRequest(BaseModel):
    status: Literal["open", "confirmed", "rejected"]
    confidence: float | None = Field(default=None, ge=0, le=1)
