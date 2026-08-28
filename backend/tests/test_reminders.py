def test_create_reminder(client_app):
    payload = {
        "id": "rem1",
        "patientId": "pat1",
        "type": "medicine",
        "titleKey": "med_reminder",
        "schedule": "08:00",
        "recurrence": {"frequency": "daily"}
    }
    response = client_app.post("/reminders", json=payload)
    assert response.status_code == 200
    assert response.json()["id"] == "rem1"

def test_get_reminders(client_app):
    payload = {
        "id": "rem2",
        "patientId": "pat1",
        "type": "medicine",
        "titleKey": "med_reminder",
        "schedule": "08:00"
    }
    client_app.post("/reminders", json=payload)
    response = client_app.get("/patients/pat1/reminders")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_update_reminder(client_app):
    payload = {
        "id": "rem3",
        "patientId": "pat1",
        "type": "medicine",
        "titleKey": "med_reminder",
        "schedule": "08:00"
    }
    client_app.post("/reminders", json=payload)
    response = client_app.patch("/reminders/rem3", json={"schedule": "09:00"})
    assert response.status_code == 200
    assert response.json()["schedule"] == "09:00"

def test_delete_reminder(client_app):
    payload = {
        "id": "rem4",
        "patientId": "pat1",
        "type": "medicine",
        "titleKey": "med_reminder",
        "schedule": "08:00"
    }
    client_app.post("/reminders", json=payload)
    response = client_app.delete("/reminders/rem4")
    assert response.status_code == 204
    
    response2 = client_app.get("/patients/pat1/reminders")
    assert len(response2.json()) == 0

def test_create_reminder_event(client_app):
    payload = {
        "id": "rem5",
        "patientId": "pat1",
        "type": "medicine",
        "titleKey": "med_reminder",
        "schedule": "08:00"
    }
    client_app.post("/reminders", json=payload)
    
    event_payload = {
        "id": "evt1",
        "reminderId": "rem5",
        "patientId": "pat1",
        "scheduledAt": "2023-01-01T08:00:00Z",
        "status": "completed",
        "completedAt": "2023-01-01T08:05:00Z"
    }
    response = client_app.post("/reminders/rem5/events", json=event_payload)
    assert response.status_code == 200
    assert response.json()["id"] == "evt1"
