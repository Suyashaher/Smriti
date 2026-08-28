import pytest

def test_list_assigned_patients(client_app, db, auth_headers_factory):
    cg_id = "cg-test-multi"
    db.caregivers.insert_one({"id": cg_id, "email": "multi@example.com", "name": "Multi Patient CG"})
    
    # Insert multiple patients
    db.patients.insert_many([
        {"id": "pat-101", "displayName": "Patient One"},
        {"id": "pat-102", "displayName": "Patient Two"},
        {"id": "pat-103", "displayName": "Patient Three"}
    ])
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    db.patient_caregiver.insert_many([
        {"patientId": "pat-101", "caregiverId": cg_id, "assignedAt": now},
        {"patientId": "pat-102", "caregiverId": cg_id, "assignedAt": now},
        {"patientId": "pat-103", "caregiverId": cg_id, "assignedAt": now}
    ])
    
    # Fetch patients
    resp = client_app.get(
        f"/caregivers/{cg_id}/patients",
        headers=auth_headers_factory(cg_id)
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    
    patient_ids = [p["id"] for p in data]
    assert "pat-101" in patient_ids
    assert "pat-102" in patient_ids
    assert "pat-103" in patient_ids
