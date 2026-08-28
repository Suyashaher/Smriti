import { db } from "./database";
import type { RoutineRecord, RoutineTask } from "@/types";
import { syncService } from "@/services/syncService";

export async function getDailyRoutine(patientId: string): Promise<RoutineRecord | undefined> {
  return await db.routines.where("patientId").equals(patientId).first();
}

export async function saveDailyRoutine(patientId: string, items: RoutineTask[]): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getDailyRoutine(patientId);

  let record: RoutineRecord;
  if (existing) {
    record = { ...existing, items, updatedAt: now };
    await db.routines.update(existing.id, { items, updatedAt: now });
  } else {
    record = {
      id: crypto.randomUUID(),
      patientId,
      items,
      createdAt: now,
      updatedAt: now,
    };
    await db.routines.add(record);
  }

  await syncService.enqueue(
    "ROUTINE",
    record.id,
    existing ? "UPDATE" : "CREATE",
    patientId,
    record
  ).catch(console.error);
}

export async function toggleRoutineItem(patientId: string, itemId: string, completedToday: boolean): Promise<void> {
  const routine = await getDailyRoutine(patientId);
  if (!routine) return;

  const items = routine.items.map(item => 
    item.id === itemId ? { ...item, completedToday } : item
  );

  await saveDailyRoutine(patientId, items);
}

export async function resetDailyRoutineStatus(patientId: string): Promise<void> {
  const routine = await getDailyRoutine(patientId);
  if (!routine) return;

  const items = routine.items.map(item => ({ ...item, completedToday: false }));
  
  const now = new Date().toISOString();
  await db.routines.update(routine.id, { items, updatedAt: now });
  // We do not queue a sync event for daily reset since it's inferred by date on both ends,
  // or it could be done if we had a daily tracker. For now, offline reset is local.
}
