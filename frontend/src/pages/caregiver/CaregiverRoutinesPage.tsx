import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { getDailyRoutine, saveDailyRoutine } from "@/db/routines";
import type { RoutineTask } from "@/types";

export function CaregiverRoutinesPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const patientId = session?.patientId;
  const [items, setItems] = useState<RoutineTask[]>([]);

  const loadRoutine = async () => {
    if (!patientId) return;
    const data = await getDailyRoutine(patientId);
    if (data) {
      setItems(data.items.sort((a, b) => a.sortOrder - b.sortOrder));
    }
  };

  useEffect(() => {
    loadRoutine();
  }, [patientId]);

  const handleAddDemo = async () => {
    if (!patientId) return;
    const demoItems: RoutineTask[] = [
      { id: crypto.randomUUID(), time: "07:00", titleKey: "routine.demo.wakeup", icon: "sun", sortOrder: 1, completedToday: false },
      { id: crypto.randomUUID(), time: "08:00", titleKey: "routine.demo.breakfast", icon: "coffee", sortOrder: 2, completedToday: false },
      { id: crypto.randomUUID(), time: "08:30", titleKey: "reminders.type.medicine", icon: "pill", sortOrder: 3, completedToday: false },
    ];
    await saveDailyRoutine(patientId, demoItems);
    await loadRoutine();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    
    // Update sortOrder
    const sorted = newItems.map((item, i) => ({ ...item, sortOrder: i }));
    setItems(sorted);
    if (patientId) await saveDailyRoutine(patientId, sorted);
  };

  const handleDelete = async (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    if (patientId) await saveDailyRoutine(patientId, newItems);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <ElderlyHeader title={t("caregiver.routinesTitle")} />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("caregiver.dailyRoutine")}</h2>
        <button
          onClick={handleAddDemo}
          className="flex items-center gap-2 bg-elder-primary text-white px-4 py-2 rounded-lg font-bold"
        >
          <Plus size={20} />
          {t("caregiver.addRoutine")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-gray-500 italic">{t("routine.empty")}</p>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow border border-gray-200">
              <div className="flex items-center gap-4">
                <span className="font-bold text-elder-primary w-16">{item.time}</span>
                <p className="font-semibold text-lg">{t(item.titleKey)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleMove(index, -1)} disabled={index === 0} aria-label={t("a11y.moveUp")} className="p-2 text-gray-500 disabled:opacity-30"><ArrowUp size={20}/></button>
                <button onClick={() => handleMove(index, 1)} disabled={index === items.length - 1} aria-label={t("a11y.moveDown")} className="p-2 text-gray-500 disabled:opacity-30"><ArrowDown size={20}/></button>
                <button onClick={() => handleDelete(item.id)} aria-label={t("a11y.deleteItem")} className="p-2 text-red-500"><Trash2 size={20}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
