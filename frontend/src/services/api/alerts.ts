import { api } from "./client";

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: "missed_medication" | "cognitive_decline" | "wandering" | "general";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
}

export const alertsApi = {
  getAlerts: () => {
    return api.get<Alert[]>("/alerts");
  },
  acknowledgeAlert: (alertId: string) => {
    return api.post<{ success: boolean }>(`/alerts/${alertId}/acknowledge`, {});
  },
};
