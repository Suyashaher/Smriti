import { db } from "./database";
import type { ReminderRecord } from "@/types";
import { syncService } from "@/services/syncService";

export async function createReminder(
  patientId: string,
  type: ReminderRecord["type"],
  titleKey: string,
  schedule: string,
  recurrence?: ReminderRecord["recurrence"]
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const reminder: ReminderRecord = {
    id,
    patientId,
    type,
    titleKey,
    schedule,
    recurrence,
    createdAt: now,
    updatedAt: now,
  };
  await db.reminders.add(reminder);
  await syncService.enqueue("REMINDER", id, "CREATE", patientId, reminder).catch(console.error);
  return id;
}

export async function updateReminder(
  id: string,
  updates: Partial<Omit<ReminderRecord, "id" | "patientId" | "createdAt">>
): Promise<void> {
  const now = new Date().toISOString();
  
  // We need patientId for sync
  const existing = await db.reminders.get(id);
  if (!existing) return;

  const updated = { ...existing, ...updates, updatedAt: now };
  await db.reminders.put(updated);
  
  await syncService.enqueue("REMINDER", id, "UPDATE", updated.patientId, updated).catch(console.error);
}

export async function deleteReminder(id: string): Promise<void> {
  const existing = await db.reminders.get(id);
  if (!existing) return;

  await db.transaction("rw", db.reminders, db.reminderEvents, async () => {
    await db.reminders.delete(id);
    const events = await db.reminderEvents.where("reminderId").equals(id).toArray();
    const eventIds = events.map(e => e.id);
    if (eventIds.length > 0) {
      await db.reminderEvents.bulkDelete(eventIds);
    }
  });

  await syncService.enqueue("REMINDER", id, "DELETE", existing.patientId, { id }).catch(console.error);
}

export async function listReminders(patientId: string): Promise<ReminderRecord[]> {
  return await db.reminders.where("patientId").equals(patientId).toArray();
}

/**
 * Gets all reminders that apply to today (based on recurrence rules or one-off schedule)
 * and returns them mapped as today's occurrences with correct timestamps.
 */
export async function getTodayReminders(patientId: string, date: Date = new Date()): Promise<
  Array<ReminderRecord & { scheduledAt: string }>
> {
  const allReminders = await listReminders(patientId);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dateStr = date.toISOString().split("T")[0];

  const todaysReminders: Array<ReminderRecord & { scheduledAt: string }> = [];

  for (const r of allReminders) {
    let appliesToday = false;
    
    if (!r.recurrence) {
      // One-off reminder. Check if scheduled date matches today.
      const rDate = r.schedule.split("T")[0];
      if (rDate === dateStr) {
        appliesToday = true;
      }
    } else if (r.recurrence.frequency === "daily") {
      appliesToday = true;
    } else if (r.recurrence.frequency === "weekly" && r.recurrence.daysOfWeek) {
      if (r.recurrence.daysOfWeek.includes(dayOfWeek)) {
        appliesToday = true;
      }
    }

    if (appliesToday) {
      // Extract time from schedule, which might be HH:MM or ISO
      let timeStr = "09:00";
      if (r.schedule.includes("T")) {
        timeStr = r.schedule.split("T")[1].substring(0, 5); // "HH:MM"
      } else if (r.schedule.includes(":")) {
        timeStr = r.schedule;
      }
      
      todaysReminders.push({
        ...r,
        scheduledAt: `${dateStr}T${timeStr}:00.000Z` // This is local time pseudo-ISO, but sufficient for sorting
      });
    }
  }

  // Sort chronologically
  todaysReminders.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  
  return todaysReminders;
}

