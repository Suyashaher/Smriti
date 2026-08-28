import { api } from "./client";

export interface PatientDTO {
  id: string;
  displayName: string;
  preferredLanguage: string;
  contentPack: string;
  createdAt: string;
  updatedAt: string;
}

export const patientsApi = {
  get: (patientId: string) => api.get<PatientDTO>(`/patients/${patientId}`),

  create: (data: { displayName: string; preferredLanguage?: string; contentPack?: string }) =>
    api.post<PatientDTO>("/patients", data),

  update: (patientId: string, data: Partial<{ displayName: string; preferredLanguage: string; contentPack: string }>) =>
    api.patch<PatientDTO>(`/patients/${patientId}`, data),
};
