import { db } from "./database";
import type { ReminderEventRecord, ReminderStatus } from "@/types";
import { syncService } from "@/services/syncService";

export async function recordReminderEvent(
  patientId: string,
  reminderId: string,
  scheduledAt: string,
  status: ReminderStatus
): Promise<void> {
  const now = new Date().toISOString();
  
  let event = await db.reminderEvents
    .where("[patientId+scheduledAt]")
    .equals([patientId, scheduledAt])
    .first();

  let operation: "CREATE" | "UPDATE" = "UPDATE";

  if (event) {
    event.status = status;
    event.updatedAt = now;
    if (status === "completed") {
      event.completedAt = now;
    }
  } else {
    operation = "CREATE";
    event = {
      id: crypto.randomUUID(),
      reminderId,
      patientId,
      scheduledAt,
      status,
      completedAt: status === "completed" ? now : null,
      createdAt: now,
      updatedAt: now,
    };
  }

  await db.reminderEvents.put(event);

  await syncService.enqueue(
    "REMINDER_EVENT",
    event.id,
    operation,
    patientId,
    event
  ).catch(console.error);
}

export async function getReminderEventsForDate(patientId: string, date: Date = new Date()): Promise<ReminderEventRecord[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  // We fetch all for patient and filter by date.
  // In Dexie v1 we don't have a compound index for date ranges easily here.
  const allEvents = await db.reminderEvents.where("patientId").equals(patientId).toArray();
  
  return allEvents.filter(e => {
    const eventDate = new Date(e.scheduledAt);
    return eventDate >= start && eventDate <= end;
  });
}
