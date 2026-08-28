from datetime import datetime
from app.schemas.analytics import PatientAnalyticsResponse, GameAnalytics, ReminderAnalytics, RoutineAnalytics, TrendData

def get_patient_analytics(db, patient_id: str, period_start: datetime, period_end: datetime) -> PatientAnalyticsResponse:
    
    # Games
    games_cursor = db.game_results.find({
        "patientId": patient_id,
        "timestamp": {"$gte": period_start.isoformat(), "$lte": period_end.isoformat()}
    })
    games = list(games_cursor)
    total_games = len(games)
    avg_score = sum(g.get("score", 0) for g in games) / total_games if total_games > 0 else 0
    
    accuracy_trend = "STABLE"
    if total_games >= 2:
        first_half = games[:total_games//2]
        second_half = games[total_games//2:]
        avg_acc_1 = sum(g.get("accuracy", 0) for g in first_half) / len(first_half) if first_half else 0
        avg_acc_2 = sum(g.get("accuracy", 0) for g in second_half) / len(second_half) if second_half else 0
        if avg_acc_2 > avg_acc_1 + 0.05:
            accuracy_trend = "IMPROVING"
        elif avg_acc_2 < avg_acc_1 - 0.05:
            accuracy_trend = "DECLINING"

    # Reminders
    reminders_cursor = db.reminder_events.find({
        "patientId": patient_id,
        "scheduledAt": {"$gte": period_start.isoformat(), "$lte": period_end.isoformat()}
    })
    reminder_events = list(reminders_cursor)
    total_reminders = len(reminder_events)
    completed_reminders = sum(1 for r in reminder_events if r.get("status") == "completed")
    missed_reminders = total_reminders - completed_reminders
    reminder_completion_rate = completed_reminders / total_reminders if total_reminders > 0 else 0.0

    # Routines (snapshot from current state)
    routine_doc = db.routines.find_one({"patientId": patient_id})
    total_routines = 0
    completed_routines = 0
    if routine_doc:
        items = routine_doc.get("items", [])
        total_routines = len(items)
        completed_routines = sum(1 for i in items if i.get("completedToday", False))
    missed_routines = total_routines - completed_routines
    routine_completion_rate = completed_routines / total_routines if total_routines > 0 else 0.0

    # Trends
    trends_map = {}
    
    for g in games:
        date_str = g.get("timestamp", "")[:10]
        if date_str and len(date_str) == 10:
            if date_str not in trends_map:
                trends_map[date_str] = {"scores": [], "reminders_total": 0, "reminders_completed": 0}
            trends_map[date_str]["scores"].append(g.get("score", 0))
        
    for r in reminder_events:
        date_str = r.get("scheduledAt", "")[:10]
        if date_str and len(date_str) == 10:
            if date_str not in trends_map:
                trends_map[date_str] = {"scores": [], "reminders_total": 0, "reminders_completed": 0}
            trends_map[date_str]["reminders_total"] += 1
            if r.get("status") == "completed":
                trends_map[date_str]["reminders_completed"] += 1
            
    trends_list = []
    for date_str in sorted(trends_map.keys()):
        data = trends_map[date_str]
        score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else None
        completion_rate = data["reminders_completed"] / data["reminders_total"] if data["reminders_total"] > 0 else None
        trends_list.append(TrendData(date=date_str, score=score, completionRate=completion_rate))
        
    return PatientAnalyticsResponse(
        patientId=patient_id,
        periodStart=period_start,
        periodEnd=period_end,
        games=GameAnalytics(
            totalGamesPlayed=total_games,
            averageScore=avg_score,
            accuracyTrend=accuracy_trend
        ),
        reminders=ReminderAnalytics(
            totalScheduled=total_reminders,
            completed=completed_reminders,
            missed=missed_reminders,
            completionRate=reminder_completion_rate
        ),
        routines=RoutineAnalytics(
            totalRoutines=total_routines,
            completed=completed_routines,
            missed=missed_routines,
            completionRate=routine_completion_rate
        ),
        trends=trends_list
    )
