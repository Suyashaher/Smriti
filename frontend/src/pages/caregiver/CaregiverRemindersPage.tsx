import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { listReminders, createReminder, deleteReminder } from "@/db/reminders";
import type { ReminderRecord } from "@/types";

export function CaregiverRemindersPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const patientId = session?.patientId;
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);

  const loadReminders = async () => {
    if (!patientId) return;
    const data = await listReminders(patientId);
    setReminders(data);
  };

  useEffect(() => {
    loadReminders();
  }, [patientId]);

  const handleAddDemo = async () => {
    if (!patientId) return;
    await createReminder(patientId, "medicine", "reminders.type.medicine", "08:30", { frequency: "daily" });
    await createReminder(patientId, "hydration", "reminders.type.hydration", "10:00", { frequency: "daily" });
    await loadReminders();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    await loadReminders();
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <ElderlyHeader title={t("caregiver.remindersTitle")} />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("caregiver.activeReminders")}</h2>
        <button
          onClick={handleAddDemo}
          className="flex items-center gap-2 bg-elder-primary text-white px-4 py-2 rounded-lg font-bold"
        >
          <Plus size={20} />
          {t("caregiver.addReminder")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {reminders.length === 0 ? (
          <p className="text-gray-500 italic">{t("reminders.empty")}</p>
        ) : (
          reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow border border-gray-200">
              <div>
                <p className="font-bold text-lg">{t(r.titleKey)}</p>
                <p className="text-sm text-gray-500">
                  {r.schedule} • {r.recurrence?.frequency ? t(`caregiver.freq_${r.recurrence.frequency}`) : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(r.id)}
                  aria-label={t("a11y.deleteItem")}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
