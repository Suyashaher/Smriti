import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import get_db, client

TEST_DB_NAME = "eldercare_ai_test"

@pytest.fixture(scope="session")
def db_client():
    test_client = MongoClient("mongodb://localhost:27017")
    yield test_client
    test_client.drop_database(TEST_DB_NAME)
    test_client.close()

@pytest.fixture(scope="function")
def db(db_client):
    db = db_client[TEST_DB_NAME]
    # Clear collections before each test
    for collection in db.list_collection_names():
        db[collection].delete_many({})
    return db

@pytest.fixture(scope="function", autouse=True)
def mock_lifespan_events(monkeypatch):
    monkeypatch.setattr("app.main.create_indexes", lambda: None)
    monkeypatch.setattr("app.main.client.close", lambda: None)

@pytest.fixture(scope="function")
def client_app(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def auth_headers_factory(db):
    from app.api.security import create_access_token
    def _factory(caregiver_id: str):
        token = create_access_token(data={"sub": caregiver_id})
        return {"Authorization": f"Bearer {token}"}
    return _factory

@pytest.fixture(scope="function")
def auth_headers(db, auth_headers_factory):
    cg_id = "test-caregiver-1"
    db.caregivers.insert_one({"id": cg_id, "email": "testcg@example.com", "name": "Test Caregiver", "hashed_password": "fake"})
    return auth_headers_factory(cg_id)
