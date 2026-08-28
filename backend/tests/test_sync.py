def test_sync_operations(client_app):
    payload = {
        "deviceId": "dev1",
        "operations": [
            {
                "id": "op1",
                "type": "GAME_RESULT",
                "patientId": "pat1",
                "timestamp": "2023-01-01T10:00:00Z",
                "payload": {
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
            }
        ]
    }
    response = client_app.post("/sync", json=payload)
    assert response.status_code == 200
    assert len(response.json()["results"]) == 1
    assert response.json()["results"][0]["status"] == "SYNCED"
    
    # Check if game result actually synced
    games_res = client_app.get("/patients/pat1/game-results")
    assert len(games_res.json()) == 1

def test_sync_idempotent(client_app):
    payload = {
        "deviceId": "dev1",
        "operations": [
            {
                "id": "op2",
                "type": "GAME_RESULT",
                "patientId": "pat1",
                "timestamp": "2023-01-01T10:00:00Z",
                "payload": {
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
            }
        ]
    }
    client_app.post("/sync", json=payload)
    response = client_app.post("/sync", json=payload)
    assert response.status_code == 200
    assert response.json()["results"][0]["status"] == "SYNCED"

def test_sync_multiple(client_app):
    payload = {
        "deviceId": "dev1",
        "operations": [
            {
                "id": "op3",
                "type": "PATIENT_SETTINGS",
                "patientId": "pat1",
                "timestamp": "2023-01-01T10:00:00Z",
                "payload": {
                    "patientId": "pat1",
                    "language": "en",
                    "voiceEnabled": True,
                    "speechOutputEnabled": True,
                    "speechInputEnabled": False,
                    "speechRate": 1.0
                }
            },
            {
                "id": "op4",
                "type": "ROUTINE",
                "patientId": "pat1",
                "timestamp": "2023-01-01T10:00:00Z",
                "payload": {
                    "id": "rout1",
                    "patientId": "pat1",
                    "items": []
                }
            }
        ]
    }
    response = client_app.post("/sync", json=payload)
    assert response.status_code == 200
    assert len(response.json()["results"]) == 2

def test_sync_invalid_type(client_app):
    payload = {
        "deviceId": "dev1",
        "operations": [
            {
                "id": "op5",
                "type": "UNKNOWN_TYPE",
                "patientId": "pat1",
                "timestamp": "2023-01-01T10:00:00Z",
                "payload": {}
            }
        ]
    }
    response = client_app.post("/sync", json=payload)
    assert response.status_code == 200
    assert response.json()["results"][0]["status"] == "SYNCED" # It successfully processes and ignores invalid type, or if we wanted it to error we could check. Current code ignores unknown collections and records it in sync events as successful sync.
