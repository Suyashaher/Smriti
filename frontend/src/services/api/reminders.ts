import type { ReminderRecord, ReminderEventRecord } from "@/types";
import { api } from "./client";

export const remindersApi = {
  getForPatient: (patientId: string) =>
    api.get<ReminderRecord[]>(`/patients/${patientId}/reminders`),

  create: (reminder: ReminderRecord) =>
    api.post<ReminderRecord>("/reminders", reminder),

  update: (reminderId: string, data: Partial<ReminderRecord>) =>
    api.patch<ReminderRecord>(`/reminders/${reminderId}`, data),

  delete: (reminderId: string) =>
    api.delete<{ detail: string }>(`/reminders/${reminderId}`),

  createEvent: (reminderId: string, event: ReminderEventRecord) =>
    api.post<ReminderEventRecord>(`/reminders/${reminderId}/events`, event),
};
