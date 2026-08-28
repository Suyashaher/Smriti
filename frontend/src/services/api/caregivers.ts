import { api } from "./client";

export interface PatientSummary {
  id: string;
  name: string;
  lastActive: string;
  status: "stable" | "needs_attention" | "critical";
}

export const caregiverApi = {
  getPatients: (caregiverId: string) => {
    return api.get<PatientSummary[]>(`/caregivers/${caregiverId}/patients`);
  },
  assignPatient: (caregiverId: string, patientId: string) => {
    return api.post(`/caregivers/${caregiverId}/patients/${patientId}`, {});
  },
};
