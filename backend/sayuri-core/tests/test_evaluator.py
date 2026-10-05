from sayuri_core.learning import Evaluator
from sayuri_core.schemas import ScoreVector


def test_evaluator_marks_strong_task_passed() -> None:
    result = Evaluator().evaluate(
        ScoreVector(
            accuracy=0.95,
            reasoning=0.90,
            memory_use=0.85,
            tool_use=0.90,
            efficiency=0.80,
            consistency=0.95,
            user_acceptance=0.90,
        )
    )
    assert result["passed"] is True
    assert result["overall"] >= 0.75
