def test_create_game_result(client_app):
    payload = {
        "id": "game1",
        "patientId": "pat1",
        "gameId": "memory_cards",
        "score": 100,
        "accuracy": 0.8,
        "responseTime": 120.5,
        "attempts": 2,
        "difficulty": 3,
        "completed": True,
        "timestamp": "2023-01-01T10:00:00Z"
    }
    response = client_app.post("/game-results", json=payload)
    assert response.status_code == 200
    assert response.json()["id"] == "game1"

def test_create_game_result_idempotent(client_app):
    payload = {
        "id": "game2",
        "patientId": "pat1",
        "gameId": "memory_cards",
        "score": 100,
        "accuracy": 0.8,
        "responseTime": 120.5,
        "attempts": 2,
        "difficulty": 3,
        "completed": True,
        "timestamp": "2023-01-01T10:00:00Z"
    }
    client_app.post("/game-results", json=payload)
    response = client_app.post("/game-results", json=payload)
    assert response.status_code == 200

def test_get_game_results(client_app, db):
    db.patients.insert_one({"id": "pat1", "name": "Pat 1"})
    payload = {
        "id": "game3",
        "patientId": "pat1",
        "gameId": "memory_cards",
        "score": 100,
        "accuracy": 0.8,
        "responseTime": 120.5,
        "attempts": 2,
        "difficulty": 3,
        "completed": True,
        "timestamp": "2023-01-01T10:00:00Z"
    }
    client_app.post("/game-results", json=payload)
    response = client_app.get("/patients/pat1/game-results")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_invalid_game_result(client_app):
    payload = {
        "id": "game4",
        "patientId": "pat1",
        "gameId": "unknown_game", # invalid gameId
        "score": 100,
        "accuracy": 0.8,
        "responseTime": 120.5,
        "attempts": 2,
        "difficulty": 3,
        "completed": True,
        "timestamp": "2023-01-01T10:00:00Z"
    }
    response = client_app.post("/game-results", json=payload)
    assert response.status_code == 422
