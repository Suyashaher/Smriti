import { useEffect, useState } from "react";
import { Pill, Droplets, Utensils, Activity, Stethoscope, Bell } from "lucide-react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { ReminderCard } from "@/components/ReminderCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { getTodayReminders } from "@/db/reminders";
import { getReminderEventsForDate, recordReminderEvent } from "@/db/reminderEvents";
import type { ReminderType, ReminderStatus } from "@/types";

const iconMap: Record<ReminderType, React.ReactNode> = {
  medicine: <Pill />,
  hydration: <Droplets />,
  meal: <Utensils />,
  activity: <Activity />,
  appointment: <Stethoscope />,
};

interface EnrichedReminder {
  id: string;
  titleKey: string;
  time: string;
  scheduledAt: string;
  type: ReminderType;
  status: ReminderStatus;
}

export function ElderlyRemindersPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const patientId = session?.patientId;
  const [reminders, setReminders] = useState<EnrichedReminder[]>([]);

  const loadReminders = async () => {
    if (!patientId) return;
    const today = new Date();
    const records = await getTodayReminders(patientId, today);
    const events = await getReminderEventsForDate(patientId, today);

    const enriched = records.map((record) => {
      // Find event for this specific scheduled time
      const event = events.find(e => e.reminderId === record.id && e.scheduledAt === record.scheduledAt);
      const timeStr = record.scheduledAt.split("T")[1].substring(0, 5);
      
      return {
        id: record.id,
        titleKey: record.titleKey,
        time: timeStr,
        scheduledAt: record.scheduledAt,
        type: record.type,
        status: event?.status ?? "scheduled",
      };
    });

    setReminders(enriched);
  };

  useEffect(() => {
    loadReminders();
    // Refresh every minute to catch missed events if any
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, [patientId]);

  const handleAction = async (reminderId: string, scheduledAt: string, status: ReminderStatus) => {
    if (!patientId) return;
    await recordReminderEvent(patientId, reminderId, scheduledAt, status);
    await loadReminders();
  };

  return (
    <div className="flex flex-col gap-6">
      <ElderlyHeader title={t("reminders.title")} />
      
      {reminders.length === 0 ? (
        <EmptyState title={t("reminders.empty")} />
      ) : (
        <div className="flex flex-col gap-4">
          {reminders.map((r) => (
            <ReminderCard
              key={`${r.id}-${r.scheduledAt}`}
              title={t(r.titleKey)}
              time={r.time}
              icon={iconMap[r.type] || <Bell />}
              status={r.status}
              onComplete={() => handleAction(r.id, r.scheduledAt, "completed")}
              onSkip={() => handleAction(r.id, r.scheduledAt, "skipped")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

