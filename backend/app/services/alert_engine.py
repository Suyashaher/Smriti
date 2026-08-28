import uuid
from datetime import datetime, timezone
from app.schemas.alert import AlertSeverity, AlertStatus

def evaluate_patient_alerts(db, patient_id: str):
    
    # 1. Missed Reminders (False-alert prevention: >= 3 missed reminders recently)
    recent_events = list(db.reminder_events.find({
        "patientId": patient_id
    }).sort("scheduledAt", -1).limit(5))
    
    missed_count = sum(1 for e in recent_events if e.get("status") in ["missed", "skipped"])
    
    if missed_count >= 3:
        existing_alert = db.alerts.find_one({
            "patientId": patient_id,
            "type": "MISSED_REMINDERS",
            "status": AlertStatus.NEW.value
        })
        if not existing_alert:
            alert = {
                "id": str(uuid.uuid4()),
                "patientId": patient_id,
                "caregiverId": None,
                "severity": AlertSeverity.WARNING.value,
                "type": "MISSED_REMINDERS",
                "message": "Several reminders were missed recently.",
                "status": AlertStatus.NEW.value,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            db.alerts.insert_one(alert)

    # 2. Game Performance Drop
    recent_games = list(db.game_results.find({
        "patientId": patient_id
    }).sort("timestamp", -1).limit(5))
    
    if len(recent_games) >= 3:
        # Check if accuracy is consistently low or dropping
        accuracies = [g.get("accuracy", 0) for g in recent_games]
        if sum(accuracies) / len(accuracies) < 0.4:
            existing_alert = db.alerts.find_one({
                "patientId": patient_id,
                "type": "PERFORMANCE_DROP",
                "status": AlertStatus.NEW.value
            })
            if not existing_alert:
                alert = {
                    "id": str(uuid.uuid4()),
                    "patientId": patient_id,
                    "caregiverId": None,
                    "severity": AlertSeverity.INFO.value,
                    "type": "PERFORMANCE_DROP",
                    "message": "A decrease in activity performance has been observed.",
                    "status": AlertStatus.NEW.value,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                }
                db.alerts.insert_one(alert)

def acknowledge_alert(db, alert_id: str, caregiver_id: str):
    db.alerts.update_one(
        {"id": alert_id},
        {"$set": {
            "status": AlertStatus.ACKNOWLEDGED.value,
            "caregiverId": caregiver_id,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
