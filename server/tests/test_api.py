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
    # This is a placeholder test. A real test would mock the database.
    response = test_client.post("/api/v1/sessions")
    assert response.status_code == 201
    data = response.json()
    assert "sessionId" in data
    assert "createdAt" in data
    assert data["status"] == "created"
