import pytest
from datetime import datetime, timezone, timedelta
import uuid

def test_caregiver_authorization(client_app, db, auth_headers_factory):
    db.patients.insert_one({"id": "pat-1", "name": "John Doe"})
    db.caregivers.insert_one({"id": "cg-1", "email": "cg1@example.com", "name": "CG 1"})
    db.patient_caregiver.insert_one({"patientId": "pat-1", "caregiverId": "cg-1"})
    db.caregivers.insert_one({"id": "cg-2", "email": "cg2@example.com", "name": "CG 2"})
    
    start_date = datetime.now(timezone.utc) - timedelta(days=7)
    end_date = datetime.now(timezone.utc)
    
    resp = client_app.get(
        f"/analytics/pat-1?start_date={start_date.isoformat().replace('+', '%2B')}&end_date={end_date.isoformat().replace('+', '%2B')}",
        headers=auth_headers_factory("cg-1")
    )
    assert resp.status_code == 200
    
    resp = client_app.get(
        f"/analytics/pat-1?start_date={start_date.isoformat().replace('+', '%2B')}&end_date={end_date.isoformat().replace('+', '%2B')}",
        headers=auth_headers_factory("cg-2")
    )
    assert resp.status_code == 403

def test_analytics_calculation(client_app, db, auth_headers_factory):
    db.patients.insert_one({"id": "pat-2", "name": "Jane"})
    db.patient_caregiver.insert_one({"patientId": "pat-2", "caregiverId": "cg-1"})
    
    now = datetime.now(timezone.utc)
    for i in range(5):
        db.game_results.insert_one({
            "id": str(uuid.uuid4()),
            "patientId": "pat-2",
            "gameId": "memory_cards",
            "score": 10.0 + i,
            "accuracy": 0.5 + i*0.1,
            "timestamp": now.isoformat()
        })
        
    db.reminder_events.insert_many([
        {"id": "r1", "patientId": "pat-2", "status": "completed", "scheduledAt": now.isoformat()},
        {"id": "r2", "patientId": "pat-2", "status": "missed", "scheduledAt": now.isoformat()},
        {"id": "r3", "patientId": "pat-2", "status": "skipped", "scheduledAt": now.isoformat()}
    ])
    
    resp = client_app.get(
        f"/analytics/pat-2?start_date={(now - timedelta(days=1)).isoformat().replace('+', '%2B')}&end_date={(now + timedelta(days=1)).isoformat().replace('+', '%2B')}",
        headers=auth_headers_factory("cg-1")
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["games"]["totalGamesPlayed"] == 5
    assert data["games"]["averageScore"] == 12.0
    assert data["games"]["accuracyTrend"] == "IMPROVING"
    
    assert data["reminders"]["totalScheduled"] == 3
    assert data["reminders"]["completed"] == 1
    assert data["reminders"]["missed"] == 2
    assert abs(data["reminders"]["completionRate"] - 0.333) < 0.01

def test_alert_engine_missed_reminders(client_app, db, auth_headers_factory):
    db.patients.insert_one({"id": "pat-3", "name": "Jim"})
    db.patient_caregiver.insert_one({"patientId": "pat-3", "caregiverId": "cg-1"})
    
    now = datetime.now(timezone.utc)
    db.reminder_events.insert_many([
        {"id": "r1", "patientId": "pat-3", "status": "missed", "scheduledAt": now.isoformat()},
        {"id": "r2", "patientId": "pat-3", "status": "missed", "scheduledAt": now.isoformat()}
    ])
    
    resp = client_app.get("/alerts/pat-3", headers=auth_headers_factory("cg-1"))
    assert resp.status_code == 200
    assert len(resp.json()) == 0
    
    db.reminder_events.insert_one(
        {"id": "r3", "patientId": "pat-3", "status": "missed", "scheduledAt": now.isoformat()}
    )
    
    resp = client_app.get("/alerts/pat-3", headers=auth_headers_factory("cg-1"))
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) == 1
    assert alerts[0]["type"] == "MISSED_REMINDERS"
    assert alerts[0]["status"] == "NEW"
    
    alert_id = alerts[0]["id"]
    ack_resp = client_app.post(f"/alerts/pat-3/{alert_id}/acknowledge", headers=auth_headers_factory("cg-1"))
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "ACKNOWLEDGED"

def test_alert_engine_performance_drop(client_app, db, auth_headers_factory):
    db.patients.insert_one({"id": "pat-4", "name": "Bob"})
    db.patient_caregiver.insert_one({"patientId": "pat-4", "caregiverId": "cg-1"})
    
    now = datetime.now(timezone.utc)
    for i in range(3):
        db.game_results.insert_one({
            "id": str(uuid.uuid4()),
            "patientId": "pat-4",
            "gameId": "memory_cards",
            "score": 10.0,
            "accuracy": 0.3,
            "timestamp": (now + timedelta(minutes=i)).isoformat()
        })
        
    resp = client_app.get("/alerts/pat-4", headers=auth_headers_factory("cg-1"))
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) == 1
    assert alerts[0]["type"] == "PERFORMANCE_DROP"
    assert "decrease in activity performance" in alerts[0]["message"]
