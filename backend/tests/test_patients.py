def test_create_patient(client_app):
    response = client_app.post("/patients", json={
        "id": "pat123",
        "displayName": "John Doe",
        "preferredLanguage": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "pat123"
    assert data["displayName"] == "John Doe"

def test_get_patient(client_app):
    client_app.post("/patients", json={"id": "pat1", "displayName": "Alice"})
    response = client_app.get("/patients/pat1")
    assert response.status_code == 200
    assert response.json()["displayName"] == "Alice"

def test_update_patient(client_app):
    client_app.post("/patients", json={"id": "pat2", "displayName": "Bob"})
    response = client_app.patch("/patients/pat2", json={"displayName": "Bobby"})
    assert response.status_code == 200
    assert response.json()["displayName"] == "Bobby"

def test_get_nonexistent_patient(client_app):
    response = client_app.get("/patients/unknown")
    assert response.status_code == 404
