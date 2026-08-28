import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Calendar, Clock, Mic, HelpCircle } from "lucide-react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { getTodayReminders } from "@/db/reminders";
import { getReminderEventsForDate } from "@/db/reminderEvents";
import type { ReminderRecord } from "@/types";

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "home.greetingMorning";
  if (hour < 17) return "home.greetingAfternoon";
  return "home.greetingEvening";
}

type Mood = "good" | "okay" | "low" | null;

export function ElderlyHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.session);
  const patientId = session?.patientId;
  const [mood, setMood] = useState<Mood>(null);
  
  const [nextReminder, setNextReminder] = useState<(ReminderRecord & { scheduledAt: string }) | null>(null);

  const loadNextReminder = async () => {
    if (!patientId) return;
    const today = new Date();
    const records = await getTodayReminders(patientId, today);
    const events = await getReminderEventsForDate(patientId, today);

    // Find the first reminder that is either active now or upcoming, and not completed/skipped/missed
    let next = null;
    for (const r of records) {
      const event = events.find(e => e.reminderId === r.id && e.scheduledAt === r.scheduledAt);
      if (!event || event.status === "scheduled") {
        next = r;
        break;
      }
    }
    setNextReminder(next);
  };

  useEffect(() => {
    loadNextReminder();
    const interval = setInterval(loadNextReminder, 60000);
    return () => clearInterval(interval);
  }, [patientId]);

  return (
    <div className="flex flex-col gap-6">
      <ElderlyHeader 
        title={t(greetingKey())} 
        trailing={
          <button 
            onClick={() => navigate("/elderly/help")} 
            aria-label="Help" 
            className="text-elder-primary p-2 rounded-full hover:bg-elder-primary/10 transition-colors"
          >
            <HelpCircle size={36} />
          </button>
        }
      />
      <LanguageSelector large={false} />

      <ElderlyCard>
        <p className="mb-4 text-2xl font-semibold">{t("home.feelingPrompt")}</p>
        <div className="grid grid-cols-3 gap-3">
          <ElderlyButton
            variant="mood"
            aria-label={t("home.moodGood")}
            aria-pressed={mood === "good"}
            className={mood === "good" ? "ring-4 ring-elder-primary" : ""}
            onClick={() => setMood("good")}
          >
            😊
          </ElderlyButton>
          <ElderlyButton
            variant="mood"
            aria-label={t("home.moodOkay")}
            aria-pressed={mood === "okay"}
            className={mood === "okay" ? "ring-4 ring-elder-primary" : ""}
            onClick={() => setMood("okay")}
          >
            😐
          </ElderlyButton>
          <ElderlyButton
            variant="mood"
            aria-label={t("home.moodLow")}
            aria-pressed={mood === "low"}
            className={mood === "low" ? "ring-4 ring-elder-primary" : ""}
            onClick={() => setMood("low")}
          >
            😟
          </ElderlyButton>
        </div>
      </ElderlyCard>

      {nextReminder && (
        <article className="rounded-3xl border-4 border-elder-primary bg-elder-surface px-6 py-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-widest text-elder-primary">
            {t("home.nextReminder")}
          </h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-3xl font-extrabold text-elder-ink">
              {t(nextReminder.titleKey)}
            </p>
            <p className="text-3xl font-bold text-elder-muted">
              {nextReminder.scheduledAt.split("T")[1].substring(0, 5)}
            </p>
          </div>
          <ElderlyButton onClick={() => void navigate("/elderly/reminders")} className="w-full">
            {t("home.viewReminder")}
          </ElderlyButton>
        </article>
      )}

      <ElderlyCard onClick={() => void navigate("/elderly/games/memory_cards")}>
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Brain size={40} aria-hidden />
          {t("home.playGame")}
        </div>
      </ElderlyCard>
      <ElderlyCard onClick={() => void navigate("/elderly/reminders")}>
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Clock size={40} aria-hidden />
          {t("home.todaysReminders")}
        </div>
      </ElderlyCard>
      <ElderlyCard onClick={() => void navigate("/elderly/routine")}>
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Calendar size={40} aria-hidden />
          {t("home.todaysRoutine")}
        </div>
      </ElderlyCard>
      <ElderlyCard onClick={() => void navigate("/elderly/assistant")}>
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Mic size={40} aria-hidden />
          {t("home.talkAssistant")}
        </div>
      </ElderlyCard>
    </div>
  );
}
