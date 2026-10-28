from pathlib import Path
import subprocess
from typing import Any

from fastapi.testclient import TestClient
import pytest

from app.runtime import create_app


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


@pytest.fixture
def repository(tmp_path: Path) -> Path:
    repo = tmp_path / "target-project"
    repo.mkdir()
    git(repo, "init", "-b", "main")
    git(repo, "config", "user.email", "test@reqlens.local")
    git(repo, "config", "user.name", "ReqLens Test")
    git(repo, "remote", "add", "origin", "https://github.com/example/target-project.git")
    (repo / "README.md").write_text("# Target project\n", encoding="utf-8")
    git(repo, "add", "README.md")
    git(repo, "commit", "-m", "Initial commit")
    return repo


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(tmp_path / "data"))


def ticket_payload() -> dict[str, object]:
    return {
        "source": "linear",
        "reference": "PROD-42",
        "url": "https://linear.app/example/issue/PROD-42",
        "title": "Expose a health endpoint",
        "description": "Operators need a deterministic health signal.",
        "feature": "Service operations",
        "feature_reference": "OPS",
        "requirement": "Service health can be inspected",
        "requirement_id": "OPS-01",
        "acceptance_criteria": [
            {
                "id": "OPS-01-AC1",
                "title": "Return an OK response",
                "detail": "GET /health returns 200 and an OK payload.",
            }
        ],
    }


def start_review(client: TestClient, repository: Path) -> dict[str, Any]:
    response = client.post(
        "/api/reviews/start",
        json={"project_path": str(repository), "ticket": ticket_payload()},
    )
    assert response.status_code == 200
    payload: dict[str, Any] = response.json()
    return payload


def verified_evidence() -> dict[str, Any]:
    return {
        "criteria": [
            {
                "criterion_id": "OPS-01-AC1",
                "state": "verified",
                "implementation": ["health.py:1"],
                "evidence_label": "API test passed",
            }
        ],
        "tests": [
            {
                "id": "health-api",
                "name": "Health API contract",
                "command": "pytest tests/test_health.py",
                "kind": "api",
                "state": "verified",
                "duration_ms": 120,
                "assertions": 2,
                "requirement_ids": ["OPS-01-AC1"],
                "detail": "Response status and body passed.",
            }
        ],
    }


def test_health_and_empty_workspace(client: TestClient) -> None:
    health = client.get("/api/health")
    workspace = client.get("/api/workspace")

    assert health.status_code == 200
    assert health.json() == {"status": "ok", "version": "0.3.0"}
    assert workspace.json() == {"reviews": [], "selected_review_id": None}


def test_real_ticket_and_git_changes_build_dashboard(client: TestClient, repository: Path) -> None:
    started = start_review(client, repository)
    review_id = str(started["review_id"])
    dashboard = started["dashboard"]
    assert dashboard["project"]["repository"] == "github.com/example/target-project"
    assert dashboard["project"]["branch"] == "main"
    assert dashboard["project"]["ticket_reference"] == "PROD-42"
    assert dashboard["changes"] == []
    assert dashboard["criteria"][0]["state"] == "pending"

    (repository / "health.py").write_text(
        "def health() -> dict[str, str]:\n    return {'status': 'ok'}\n",
        encoding="utf-8",
    )
    sync = client.post(
        f"/api/reviews/{review_id}/sync",
        json={
            "criteria": [
                {
                    "criterion_id": "OPS-01-AC1",
                    "state": "verified",
                    "implementation": ["health.py:1"],
                    "evidence_label": "API test passed",
                }
            ],
            "changes": [
                {
                    "path": "health.py",
                    "requirement_ids": ["OPS-01-AC1"],
                    "summary": "Adds the health response.",
                    "rationale": "Keeps the operational contract explicit.",
                }
            ],
            "tests": [
                {
                    "id": "health-api",
                    "name": "Health API contract",
                    "command": "pytest tests/test_health.py",
                    "kind": "api",
                    "state": "verified",
                    "duration_ms": 120,
                    "assertions": 2,
                    "requirement_ids": ["OPS-01-AC1"],
                    "detail": "Response status and body passed.",
                }
            ],
            "events": [
                {
                    "actor": "Codex",
                    "title": "Health endpoint implemented",
                    "detail": "Implementation and test completed.",
                    "kind": "agent",
                }
            ],
            "preview_url": "http://127.0.0.1:8000/health",
            "pull_request": 7,
        },
    )

    assert sync.status_code == 200
    payload = sync.json()
    assert payload["status"] == "verified"
    assert payload["summary"]["acceptance_verified"] == 1
    assert payload["summary"]["checks_passed"] == 1
    assert payload["summary"]["additions"] == 2
    assert payload["changes"][0]["path"] == "health.py"
    assert "+def health()" in payload["changes"][0]["diff"]
    assert payload["changes"][0]["rationale"]["en"] == "Keeps the operational contract explicit."
    assert payload["project"]["pull_request"] == 7
    assert payload["project"]["dirty"] is True
    assert payload["project"]["decision"] == "in_review"


def test_review_is_idempotent_and_persistent(tmp_path: Path, repository: Path) -> None:
    data_dir = tmp_path / "persistent-data"
    first_client = TestClient(create_app(data_dir))
    first = start_review(first_client, repository)
    second = start_review(first_client, repository)

    assert first["created"] is True
    assert second["created"] is False
    assert second["review_id"] == first["review_id"]
    assert len(second["dashboard"]["activity"]) == len(first["dashboard"]["activity"])

    restarted_client = TestClient(create_app(data_dir))
    response = restarted_client.get(f"/api/reviews/{first['review_id']}")
    assert response.status_code == 200
    assert response.json()["project"]["ticket_source"] == "linear"


def test_ticket_change_invalidates_an_accepted_decision(client: TestClient, repository: Path) -> None:
    review_id = str(start_review(client, repository)["review_id"])
    client.post(f"/api/reviews/{review_id}/sync", json=verified_evidence())
    accepted = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "accept_review"},
    ).json()
    assert accepted["state"] == "accepted"

    changed_ticket = ticket_payload()
    changed_ticket["description"] = "Operators need a deterministic health signal with a version."
    refreshed = client.post(
        "/api/reviews/start",
        json={"project_path": str(repository), "ticket": changed_ticket},
    ).json()

    assert refreshed["created"] is False
    assert refreshed["dashboard"]["project"]["decision"] == "in_review"
    assert refreshed["dashboard"]["project"]["accepted_revision"] is None


def test_actions_have_real_outcomes(client: TestClient, repository: Path) -> None:
    review_id = str(start_review(client, repository)["review_id"])

    blocked = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "open_preview"},
    )
    assert blocked.json()["state"] == "blocked"

    client.post(
        f"/api/reviews/{review_id}/sync",
        json={"preview_url": "http://127.0.0.1:4173"},
    )
    ready = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "open_preview"},
    )
    assert ready.json()["state"] == "accepted"
    assert ready.json()["target_url"] == "http://127.0.0.1:4173"


def test_evidence_gate_requires_checks_and_blocks_required_findings(client: TestClient, repository: Path) -> None:
    review_id = str(start_review(client, repository)["review_id"])
    criterion_only = client.post(
        f"/api/reviews/{review_id}/sync",
        json={"criteria": verified_evidence()["criteria"]},
    ).json()
    assert criterion_only["status"] == "needs_evidence"

    blocked = client.post(
        f"/api/reviews/{review_id}/sync",
        json={
            "tests": verified_evidence()["tests"],
            "findings": [
                {
                    "id": "missing-case",
                    "severity": "required",
                    "category": "coverage",
                    "title": "Missing failure case",
                    "detail": "The error path has no evidence.",
                    "requirement_ids": ["OPS-01-AC1"],
                    "evidence": [],
                    "action": "Add the missing check.",
                }
            ],
        },
    ).json()
    assert blocked["status"] == "needs_evidence"

    failed = client.post(
        f"/api/reviews/{review_id}/sync",
        json={
            "tests": [
                {
                    **verified_evidence()["tests"][0],
                    "state": "failed",
                }
            ]
        },
    ).json()
    assert failed["status"] == "failed"


def test_review_decision_is_revision_bound(client: TestClient, repository: Path) -> None:
    review_id = str(start_review(client, repository)["review_id"])
    (repository / "health.py").write_text("STATUS = 'ok'\n", encoding="utf-8")
    git(repository, "add", "health.py")
    git(repository, "commit", "-m", "Add health signal")
    client.post(f"/api/reviews/{review_id}/sync", json=verified_evidence())

    accepted = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "accept_review", "note": "Evidence reviewed."},
    ).json()
    assert accepted["state"] == "accepted"
    dashboard = client.get(f"/api/reviews/{review_id}").json()
    assert dashboard["project"]["decision"] == "accepted"
    assert dashboard["project"]["accepted_revision"] == dashboard["project"]["head_revision"]

    (repository / "README.md").write_text("# Changed after acceptance\n", encoding="utf-8")
    stale = client.get(f"/api/reviews/{review_id}").json()
    assert stale["project"]["decision"] == "stale"

    missing_note = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "request_changes"},
    ).json()
    assert missing_note["state"] == "blocked"
    requested = client.post(
        f"/api/reviews/{review_id}/actions",
        json={"action": "request_changes", "note": "Restore the reviewed README."},
    ).json()
    assert requested["state"] == "accepted"
    dashboard = client.get(f"/api/reviews/{review_id}").json()
    assert dashboard["project"]["decision"] == "changes_requested"
    assert dashboard["project"]["decision_note"] == "Restore the reviewed README."


def test_studio_and_api_share_one_server(tmp_path: Path) -> None:
    studio = tmp_path / "studio"
    studio.mkdir()
    (studio / "index.html").write_text("<h1>ReqLens Studio</h1>", encoding="utf-8")
    client = TestClient(create_app(tmp_path / "data", studio))

    assert client.get("/").text == "<h1>ReqLens Studio</h1>"
    assert client.get("/api/health").json()["status"] == "ok"


def test_non_git_directory_is_rejected(client: TestClient, tmp_path: Path) -> None:
    response = client.post(
        "/api/reviews/start",
        json={"project_path": str(tmp_path), "ticket": ticket_payload()},
    )
    assert response.status_code == 422
