import { create } from "zustand";
import type { LocalSession, UserRole } from "@/types";

const DEMO_PATIENT_ID = "demo-patient-local";
const SESSION_KEY = "smriti-session";

function storage(): Storage | null {
  try {
    const s = globalThis.sessionStorage;
    return s;
  } catch {
    return null;
  }
}

function readSession(): LocalSession | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSession;
    if (!parsed.role || !parsed.patientId) return null;
    return { ...parsed, isDemo: true };
  } catch {
    return null;
  }
}

function writeSession(session: LocalSession | null): void {
  const store = storage();
  if (!store) return;
  if (!session) {
    store.removeItem(SESSION_KEY);
    return;
  }
  store.setItem(SESSION_KEY, JSON.stringify(session));
}

interface SessionState {
  session: LocalSession | null;
  setRole: (role: UserRole) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: readSession(),
  setRole: (role) => {
    const isPatient = role === "PATIENT";
    const session: LocalSession = {
      role,
      patientId: DEMO_PATIENT_ID,
      displayName: isPatient ? "Demo patient" : "Demo caregiver",
      isDemo: true,
    };
    writeSession(session);
    set({ session });
  },
  clearSession: () => {
    writeSession(null);
    set({ session: null });
  },
}));

export function isCaregiverRole(role: UserRole | undefined): boolean {
  return role === "CAREGIVER" || role === "HEALTHCARE_WORKER" || role === "ADMIN";
}
