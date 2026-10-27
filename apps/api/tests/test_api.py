from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_dashboard_returns_traceable_acceptance_data() -> None:
    response = client.get("/api/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert payload["project"]["pull_request"] == 128
    assert payload["summary"]["acceptance_verified"] == 4
    assert payload["summary"]["acceptance_total"] == 5
    assert payload["criteria"][-1]["state"] == "needs_evidence"


def test_action_is_accepted_for_current_revision() -> None:
    response = client.post(
        "/api/actions",
        json={"action": "run_acceptance", "revision": "7f3a91c"},
    )

    assert response.status_code == 200
    assert response.json()["state"] == "accepted"
    assert response.json()["action_id"]

