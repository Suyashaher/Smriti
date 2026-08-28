import { useEffect, useState } from "react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { RoutineItem } from "@/components/RoutineItem";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { getDailyRoutine, toggleRoutineItem } from "@/db/routines";
import type { RoutineRecord } from "@/types";

export function ElderlyRoutinePage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const patientId = session?.patientId;
  const [routine, setRoutine] = useState<RoutineRecord | null>(null);

  const loadRoutine = async () => {
    if (!patientId) return;
    const data = await getDailyRoutine(patientId);
    if (data) {
      // Sort items by sortOrder or time
      data.items.sort((a, b) => a.sortOrder - b.sortOrder);
      setRoutine(data);
    }
  };

  useEffect(() => {
    loadRoutine();
  }, [patientId]);

  const handleToggle = async (itemId: string, completed: boolean) => {
    if (!patientId) return;
    await toggleRoutineItem(patientId, itemId, completed);
    await loadRoutine();
  };

  return (
    <div className="flex flex-col gap-6">
      <ElderlyHeader title={t("routine.title")} />
      
      {!routine || routine.items.length === 0 ? (
        <EmptyState title={t("routine.empty")} />
      ) : (
        <div className="flex flex-col gap-4">
          {routine.items.map((item) => (
            <RoutineItem
              key={item.id}
              title={t(item.titleKey)}
              time={item.time}
              completed={item.completedToday}
              onToggle={(completed) => handleToggle(item.id, completed)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

