import type { SettingsRecord } from "@/types";
import { api } from "./client";

export interface PatientSettingsDTO extends SettingsRecord {
  patientId: string;
}

export const settingsApi = {
  getForPatient: (patientId: string) =>
    api.get<PatientSettingsDTO>(`/patients/${patientId}/settings`),

  update: (patientId: string, settings: Partial<SettingsRecord>) =>
    api.put<PatientSettingsDTO>(`/patients/${patientId}/settings`, settings),
};
