import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parent.parent / "scripts"))

from generate_sprint_report import ReportGenerator, ReportGenerationError


def test_generate_report_missing_file(tmp_path, monkeypatch) -> None:
    control = tmp_path / "project" / "demo" / "control"
    control.mkdir(parents=True)
    (tmp_path / "memory-bank").mkdir()
    (tmp_path / "memory-bank" / "decisionLog.md").write_text("# log\nentry")
    (control / "sprint.yaml").write_text("goal: test\n")
    monkeypatch.chdir(tmp_path)
    reporter = ReportGenerator("demo")
    with pytest.raises(ReportGenerationError):
        reporter.generate_report()

