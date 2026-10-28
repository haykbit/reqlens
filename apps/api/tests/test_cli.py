import json
import os
from pathlib import Path
import socket
import subprocess
import sys
from threading import Thread
import time
from typing import Any, Iterator

import pytest
import uvicorn

from app.cli import _doctor
from app.runtime import create_app


def run(repo: Path, *args: str) -> None:
    subprocess.run(args, cwd=repo, check=True, capture_output=True, text=True)


@pytest.fixture
def target_repository(tmp_path: Path) -> Path:
    repo = tmp_path / "sample-app"
    repo.mkdir()
    run(repo, "git", "init", "-b", "main")
    run(repo, "git", "config", "user.email", "test@reqlens.local")
    run(repo, "git", "config", "user.name", "ReqLens Test")
    (repo / "README.md").write_text("# Sample app\n", encoding="utf-8")
    run(repo, "git", "add", "README.md")
    run(repo, "git", "commit", "-m", "Initial commit")
    return repo


@pytest.fixture
def live_api(tmp_path: Path) -> Iterator[str]:
    with socket.socket() as candidate:
        candidate.bind(("127.0.0.1", 0))
        port = candidate.getsockname()[1]
    server = uvicorn.Server(
        uvicorn.Config(create_app(tmp_path / "data"), host="127.0.0.1", port=port, log_level="error")
    )
    thread = Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.01)
    if not server.started:
        raise RuntimeError("Test server did not start")
    yield f"http://127.0.0.1:{port}"
    server.should_exit = True
    thread.join(timeout=5)


def cli(url: str, *args: str) -> dict[str, Any]:
    env = {**os.environ, "REQLENS_API_URL": url}
    result = subprocess.run(
        [sys.executable, "-m", "app.cli", *args],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )
    value = json.loads(result.stdout)
    assert isinstance(value, dict)
    return value


def test_doctor_does_not_create_the_data_directory(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    data_dir = tmp_path / "new" / "nested"
    monkeypatch.setenv("REQLENS_DATA_DIR", str(data_dir))

    result = _doctor()

    assert result["ready"] is True
    assert result["data"] == str(data_dir)
    assert not data_dir.exists()


def test_cli_tracks_a_clean_repository_end_to_end(
    live_api: str,
    target_repository: Path,
    tmp_path: Path,
) -> None:
    ticket = tmp_path / "ticket.json"
    ticket.write_text(
        json.dumps(
            {
                "source": "manual",
                "reference": "SAMPLE-1",
                "title": "Add a status module",
                "acceptance_criteria": [{"id": "AC-1", "title": "Expose status"}],
            }
        ),
        encoding="utf-8",
    )
    started = cli(live_api, "start", "--project", str(target_repository), "--ticket", str(ticket))
    review_id = str(started["review_id"])
    assert started["created"] is True

    (target_repository / "status.py").write_text("STATUS = 'ok'\n", encoding="utf-8")
    evidence = tmp_path / "evidence.json"
    evidence.write_text(
        json.dumps(
            {
                "criteria": [
                    {
                        "criterion_id": "AC-1",
                        "state": "verified",
                        "implementation": ["status.py"],
                        "evidence_label": "Status check passed",
                    }
                ],
                "tests": [
                    {
                        "id": "status-check",
                        "name": "Status check",
                        "command": "python -m pytest",
                        "kind": "unit",
                        "state": "verified",
                        "assertions": 1,
                        "requirement_ids": ["AC-1"],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    synced = cli(live_api, "sync", review_id, "--evidence", str(evidence))
    shown = cli(live_api, "show", review_id)

    assert synced["status"] == "verified"
    assert shown["project"]["repository"] == "sample-app"
    assert shown["changes"][0]["path"] == "status.py"
    assert "+STATUS = 'ok'" in shown["changes"][0]["diff"]
