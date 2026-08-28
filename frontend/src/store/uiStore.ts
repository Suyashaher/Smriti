import { create } from "zustand";
import { persistLanguage } from "@/db/init";
import type { LocaleCode } from "@/types";

interface UiState {
  locale: LocaleCode;
  online: boolean;
  dbReady: boolean;
  dbError: string | null;
  backendAvailable: boolean;
  syncStatus: "idle" | "syncing" | "synced" | "error";
  setLocale: (locale: LocaleCode) => Promise<void>;
  setOnline: (online: boolean) => void;
  setDbReady: (ready: boolean) => void;
  setDbError: (message: string | null) => void;
  setBackendAvailable: (available: boolean) => void;
  setSyncStatus: (status: "idle" | "syncing" | "synced" | "error") => void;
}

export const useUiStore = create<UiState>((set) => ({
  locale: "en",
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  dbReady: false,
  dbError: null,
  backendAvailable: false,
  syncStatus: "idle",
  setLocale: async (locale) => {
    set({ locale });
    await persistLanguage(locale);
    document.documentElement.lang = locale === "kh" ? "kha" : "en";
  },
  setOnline: (online) => set({ online }),
  setDbReady: (dbReady) => set({ dbReady }),
  setDbError: (dbError) => set({ dbError }),
  setBackendAvailable: (backendAvailable) => set({ backendAvailable }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));
