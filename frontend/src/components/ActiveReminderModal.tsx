import { useEffect } from "react";
import { Check, X, Clock } from "lucide-react";
import { useReminderStore } from "@/store/reminderStore";
import { useTranslation } from "@/hooks/useTranslation";

export function ActiveReminderModal() {
  const { t } = useTranslation();
  const { activeReminder, markComplete, markSkipped, snooze, startScheduler, stopScheduler } = useReminderStore();

  useEffect(() => {
    startScheduler();
    return () => stopScheduler();
  }, [startScheduler, stopScheduler]);

  if (!activeReminder) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t("reminders.itsTimeFor")}>
      <div className="w-full max-w-lg rounded-3xl bg-elder-surface p-8 shadow-2xl border-4 border-elder-primary">
        <h2 className="mb-6 text-center text-4xl font-bold text-elder-primary">
          {t("reminders.itsTimeFor")}
        </h2>
        
        <div className="mb-10 text-center">
          <p className="text-5xl font-extrabold text-elder-ink leading-tight">
            {t(activeReminder.titleKey)}
          </p>
          <p className="mt-4 text-3xl font-bold text-elder-muted">
            {activeReminder.scheduledAt.split("T")[1].substring(0, 5)}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => markComplete(activeReminder.id, activeReminder.scheduledAt)}
            className="flex items-center justify-center gap-4 rounded-2xl bg-elder-primary py-6 text-3xl font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            <Check size={40} />
            {t("reminders.actionDone")}
          </button>
          
          <button
            onClick={() => snooze(activeReminder.id, 15)}
            className="flex items-center justify-center gap-4 rounded-2xl bg-elder-accent py-6 text-3xl font-bold text-elder-surface shadow-lg active:scale-95 transition-transform"
          >
            <Clock size={40} />
            {t("reminders.actionSnooze")}
          </button>

          <button
            onClick={() => markSkipped(activeReminder.id, activeReminder.scheduledAt)}
            className="mt-4 flex items-center justify-center gap-4 rounded-2xl bg-gray-200 py-4 text-2xl font-bold text-gray-700 active:scale-95 transition-transform"
          >
            <X size={32} />
            {t("reminders.actionSkip")}
          </button>
        </div>
      </div>
    </div>
  );
}
