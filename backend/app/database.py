from pymongo import MongoClient, ASCENDING
from .config import settings

client = MongoClient(settings.mongodb_uri)

def get_db():
    return client[settings.mongodb_database]

def create_indexes():
    db = get_db()
    # patients: unique on id
    db.patients.create_index("id", unique=True)
    
    # game_results
    db.game_results.create_index("id", unique=True)
    db.game_results.create_index([("patientId", ASCENDING), ("timestamp", ASCENDING)])
    db.game_results.create_index([("gameId", ASCENDING), ("timestamp", ASCENDING)])
    
    # reminders
    db.reminders.create_index("id", unique=True)
    db.reminders.create_index("patientId")
    
    # reminder_events
    db.reminder_events.create_index("id", unique=True)
    db.reminder_events.create_index([("patientId", ASCENDING), ("scheduledAt", ASCENDING)])
    
    # routines
    db.routines.create_index("id", unique=True)
    db.routines.create_index("patientId")
    
    # patient_settings
    db.patient_settings.create_index("patientId", unique=True)
    
    # sync_events
    db.sync_events.create_index("id", unique=True)
    db.sync_events.create_index([("patientId", ASCENDING), ("timestamp", ASCENDING)])
    
    # devices
    db.devices.create_index("deviceId", unique=True)
    
    # caregivers
    db.caregivers.create_index("id", unique=True)
    db.caregivers.create_index("email", unique=True)
    
    # patient_caregiver
    db.patient_caregiver.create_index([("patientId", ASCENDING), ("caregiverId", ASCENDING)], unique=True)
    db.patient_caregiver.create_index("caregiverId")
    
    # alerts
    db.alerts.create_index("id", unique=True)
    db.alerts.create_index([("patientId", ASCENDING), ("createdAt", ASCENDING)])
    db.alerts.create_index("caregiverId")
    db.alerts.create_index("status")
    
    # family_members
    db.family_members.create_index("id", unique=True)
    db.family_members.create_index("patientId")

def check_health():
    try:
        client.admin.command('ping')
        return True
    except Exception:
        return False
