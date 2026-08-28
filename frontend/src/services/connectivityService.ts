import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";
import { api } from "./api/client";
import { syncService } from "./syncService";

const PROBE_INTERVAL_MS = 60_000;
const PROBE_RETRY_MS = 15_000;

let probeTimer: number | undefined;

export function useConnectivityService() {
  const { setOnline, setBackendAvailable, backendAvailable } = useUiStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      void probeBackend(); // Immediately probe when network returns
    };
    
    const handleOffline = () => {
      setOnline(false);
      setBackendAvailable(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial state
    setOnline(navigator.onLine);
    if (navigator.onLine) {
      void probeBackend();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (probeTimer) window.clearTimeout(probeTimer);
    };
  }, [setOnline, setBackendAvailable]);

  // When backend becomes available, start sync
  useEffect(() => {
    if (backendAvailable) {
      void syncService.processQueue();
    }
  }, [backendAvailable]);

  async function probeBackend() {
    if (probeTimer) window.clearTimeout(probeTimer);
    if (!useUiStore.getState().online) return;

    try {
      const res = await api.get<{ status: string }>("/health");
      const isAvailable = res.ok && res.data?.status === "ok";
      
      const wasAvailable = useUiStore.getState().backendAvailable;
      if (isAvailable !== wasAvailable) {
        useUiStore.getState().setBackendAvailable(isAvailable);
      }

      // Schedule next probe
      const nextDelay = isAvailable ? PROBE_INTERVAL_MS : PROBE_RETRY_MS;
      probeTimer = window.setTimeout(probeBackend, nextDelay);
    } catch {
      useUiStore.getState().setBackendAvailable(false);
      probeTimer = window.setTimeout(probeBackend, PROBE_RETRY_MS);
    }
  }
}
