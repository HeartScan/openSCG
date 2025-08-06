from fastapi.testclient import TestClient

def test_health_check(test_client: TestClient):
    """
    Tests the health check endpoint.
    """
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_session(test_client: TestClient):
    """
    Tests the session creation endpoint.
    """
    response = test_client.post("/api/v1/sessions")
    assert response.status_code == 200
    data = response.json()
    assert "sessionId" in data
    assert "createdAt" in data
    assert "viewerUrl" in data
    assert "websocketUrl" in data
    assert data["status"] == "created"


def test_end_session(test_client: TestClient):
    """
    Tests the session end endpoint.
    """
    # First, create a session
    response = test_client.post("/api/v1/sessions")
    assert response.status_code == 200
    session_id = response.json()["sessionId"]

    # Now, end the session
    response = test_client.post(f"/api/v1/sessions/{session_id}/end")
    assert response.status_code == 200
    assert response.json() == {"message": "Session ended successfully."}
