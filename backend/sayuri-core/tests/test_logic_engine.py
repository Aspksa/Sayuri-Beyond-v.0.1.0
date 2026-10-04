from sayuri_core.logic_engine import LogicEngine


def test_hyperon_executes_metta() -> None:
    result = LogicEngine().run("!(+ 1 1)")
    assert result
