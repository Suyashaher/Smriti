import { db } from "@/db/database";
import { syncApi } from "./api/sync";
import type { SyncQueueItem, SyncEntityType, SyncOperation } from "@/types";
import { useUiStore } from "@/store/uiStore";

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 5000;
const MAX_BACKOFF_MS = 60000;

function getBackoff(retryCount: number): number {
  if (retryCount === 0) return 0;
  const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount - 1);
  return Math.min(backoff, MAX_BACKOFF_MS);
}

export const syncService = {
  /**
   * Enqueue a new operation to be synced.
   */
  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    patientId: string,
    payload: unknown,
  ): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const item: SyncQueueItem = {
      id,
      entityType,
      entityId,
      operation,
      patientId,
      payload,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      lastAttemptAt: null,
      error: null,
    };

    await db.syncQueue.put(item);

    // Try to process immediately if online
    if (useUiStore.getState().backendAvailable) {
      void this.processQueue();
    }
  },

  /**
   * Process pending items in the queue.
   */
  async processQueue(): Promise<void> {
    const { backendAvailable, setSyncStatus } = useUiStore.getState();
    if (!backendAvailable) return;

    setSyncStatus("syncing");
    let hasErrors = false;

    try {
      const now = new Date();
      
      // Get pending or failed items that are ready for retry
      const items = await db.syncQueue
        .filter((item) => {
          if (item.status === "SYNCED") return false;
          if (item.status === "FAILED" && item.retryCount >= MAX_RETRIES) return false;
          
          if (item.status === "FAILED" && item.lastAttemptAt) {
            const backoff = getBackoff(item.retryCount);
            const nextAttempt = new Date(new Date(item.lastAttemptAt).getTime() + backoff);
            if (now < nextAttempt) return false;
          }
          
          return true;
        })
        .toArray();

      if (items.length === 0) {
        setSyncStatus("synced");
        return;
      }

      // Mark as syncing
      const nowStr = now.toISOString();
      for (const item of items) {
        item.status = "SYNCING";
        item.lastAttemptAt = nowStr;
        item.retryCount += 1;
        await db.syncQueue.put(item);
      }

      // Get device ID
      const meta = await db.meta.get("device");
      const deviceId = meta?.deviceId || "unknown";

      // Map items to backend schema
      const operations = items.map(item => ({
        id: item.id,
        type: item.entityType,
        patientId: item.patientId,
        timestamp: item.createdAt,
        payload: item.payload,
      }));

      // Send batch
      const res = await syncApi.syncBatch({ deviceId, operations });

      if (res.ok && res.data) {
        // Process results
        for (const result of res.data.results) {
          const item = items.find((i) => i.id === result.operationId);
          if (item) {
            if (result.status === "SYNCED") {
              item.status = "SYNCED";
              item.error = null;
            } else {
              item.status = "FAILED";
              item.error = result.error || "Unknown error";
              hasErrors = true;
            }
            item.updatedAt = new Date().toISOString();
            await db.syncQueue.put(item);
          }
        }
      } else {
        // Request failed completely (network issue, server error)
        hasErrors = true;
        for (const item of items) {
          item.status = "FAILED";
          item.error = res.error || "Batch request failed";
          item.updatedAt = new Date().toISOString();
          await db.syncQueue.put(item);
        }
      }
    } catch (err) {
      console.error("Sync process failed:", err);
      hasErrors = true;
    } finally {
      // Check if any pending items exist
      const remainingPending = await db.syncQueue
        .where("status")
        .anyOf("PENDING")
        .count();
        
      const remainingFailed = await db.syncQueue
        .filter(i => i.status === "FAILED" && i.retryCount < MAX_RETRIES)
        .count();

      if (hasErrors || remainingFailed > 0) {
        setSyncStatus("error");
      } else if (remainingPending > 0) {
        // More items were added while we were syncing
        void this.processQueue();
      } else {
        setSyncStatus("synced");
      }
    }
  },
};
