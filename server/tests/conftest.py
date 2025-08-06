import pytest
from fastapi.testclient import TestClient
import os
import sys
from unittest.mock import MagicMock

# Add the server directory to the path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.database import get_db

# Mock the database dependency for API endpoints
def get_db_mock():
    return MagicMock()

app.dependency_overrides[get_db] = get_db_mock

@pytest.fixture(scope="function")
def test_client(monkeypatch):
    """
    Creates a FastAPI test client with mocked startup events and database.
    """
    # Mock the functions called during startup
    monkeypatch.setattr("app.main.setup_logging", lambda: None)
    monkeypatch.setattr("app.main.initialize_database", lambda: None)

    with TestClient(app) as client:
        yield client
