import { create } from "zustand";
import { getTodayReminders } from "@/db/reminders";
import { recordReminderEvent } from "@/db/reminderEvents";
import { sendNativeNotification } from "@/services/notificationService";
import type { ReminderRecord } from "@/types";
import { useSessionStore } from "./sessionStore";
import { useUiStore } from "./uiStore";
import { isTimePassed, isOverdue } from "@/db/dateUtils";
import { translate } from "@/i18n";

export interface ActiveReminder extends ReminderRecord {
  scheduledAt: string;
}

interface ReminderState {
  activeReminder: ActiveReminder | null;
  snoozedReminders: Record<string, string>; // reminderId -> snoozed until ISO string
  isChecking: boolean;
  
  // Actions
  startScheduler: () => void;
  stopScheduler: () => void;
  checkDueReminders: () => Promise<void>;
  markComplete: (reminderId: string, scheduledAt: string) => Promise<void>;
  markSkipped: (reminderId: string, scheduledAt: string) => Promise<void>;
  snooze: (reminderId: string, minutes: number) => void;
  dismissActive: () => void;
}

let checkInterval: number | undefined;

export const useReminderStore = create<ReminderState>((set, get) => ({
  activeReminder: null,
  snoozedReminders: {},
  isChecking: false,

  startScheduler: () => {
    if (checkInterval) return;
    // Check every 30 seconds
    checkInterval = window.setInterval(() => {
      get().checkDueReminders();
    }, 30000);
    // Also run immediately
    get().checkDueReminders();
  },

  stopScheduler: () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = undefined;
    }
  },

  checkDueReminders: async () => {
    if (get().isChecking) return;
    set({ isChecking: true });

    try {
      const patientId = useSessionStore.getState().session?.patientId;
      if (!patientId) return;

      const todaysReminders = await getTodayReminders(patientId);
      const now = new Date();
      
      let nextActive: ActiveReminder | null = null;

      for (const reminder of todaysReminders) {
        // If it's passed but less than 30 mins, it's due
        // If it's > 30 mins, it's missed
        
        // Check if snoozed
        const snoozedUntil = get().snoozedReminders[reminder.id];
        if (snoozedUntil && new Date(snoozedUntil) > now) {
          continue; // Still snoozing
        }

        const scheduledTimeStr = reminder.scheduledAt.split("T")[1].substring(0, 5); // HH:MM
        
        if (isTimePassed(scheduledTimeStr)) {
          if (isOverdue(scheduledTimeStr, 30)) {
            await recordReminderEvent(patientId, reminder.id, reminder.scheduledAt, "missed");
          } else {
            // Due!
            nextActive = reminder;
            break; // Only show one at a time
          }
        }
      }

      const currentActive = get().activeReminder;
      if (nextActive && (!currentActive || currentActive.id !== nextActive.id)) {
        set({ activeReminder: nextActive });
        const locale = useUiStore.getState().locale;
        sendNativeNotification(translate(locale, "notifications.reminderTitle"), {
          body: translate(locale, "notifications.reminderBody"),
        });
        // Voice announcement (non-blocking)
        try {
          const { getVoiceService } = await import("@/services/voice/VoiceService");
          const voiceService = getVoiceService();
          const typeKey: Record<string, string> = {
            medicine: "voiceFeedback.medicineTime",
            hydration: "voiceFeedback.drinkWater",
            activity: "voiceFeedback.activityTime",
            meal: "voiceFeedback.mealTime",
          };
          const key = typeKey[nextActive.type] ?? "notifications.reminderBody";
          voiceService.tts.speakKey(key, locale, 0.85).catch(() => {});
        } catch {
          // Voice unavailable — silent fallback
        }
      } else if (!nextActive) {
        set({ activeReminder: null });
      }

    } finally {
      set({ isChecking: false });
    }
  },

  markComplete: async (reminderId, scheduledAt) => {
    const patientId = useSessionStore.getState().session?.patientId;
    if (patientId) {
      await recordReminderEvent(patientId, reminderId, scheduledAt, "completed");
    }
    set({ activeReminder: null });
    get().checkDueReminders();
  },

  markSkipped: async (reminderId, scheduledAt) => {
    const patientId = useSessionStore.getState().session?.patientId;
    if (patientId) {
      await recordReminderEvent(patientId, reminderId, scheduledAt, "skipped");
    }
    set({ activeReminder: null });
    get().checkDueReminders();
  },

  snooze: (reminderId, minutes) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
    
    set((state) => ({
      activeReminder: null,
      snoozedReminders: {
        ...state.snoozedReminders,
        [reminderId]: snoozeTime.toISOString()
      }
    }));
  },

  dismissActive: () => {
    set({ activeReminder: null });
  }
}));
