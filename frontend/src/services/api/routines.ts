import type { RoutineRecord } from "@/types";
import { api } from "./client";

export const routinesApi = {
  getForPatient: (patientId: string) =>
    api.get<RoutineRecord>(`/patients/${patientId}/routine`),

  create: (routine: RoutineRecord) =>
    api.post<RoutineRecord>("/routines", routine),

  update: (routineId: string, data: Partial<RoutineRecord>) =>
    api.patch<RoutineRecord>(`/routines/${routineId}`, data),

  delete: (routineId: string) =>
    api.delete<{ detail: string }>(`/routines/${routineId}`),
};
