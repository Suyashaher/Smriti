
import { api } from "./client";

export interface SyncOperationItem {
  id: string;
  type: string;
  patientId: string;
  timestamp: string;
  payload: unknown;
}

export interface SyncBatchRequest {
  deviceId: string;
  operations: SyncOperationItem[];
}

export interface SyncItemResult {
  operationId: string;
  status: "SYNCED" | "FAILED";
  error?: string;
}

export interface SyncBatchResponse {
  results: SyncItemResult[];
}

export const syncApi = {
  syncBatch: (request: SyncBatchRequest) =>
    api.post<SyncBatchResponse>("/sync", request),
};
