import { memo, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import type { ReminderStatus } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface ReminderCardProps {
  icon: ReactNode;
  title: string;
  time?: string;
  status?: ReminderStatus;
  onComplete?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export const ReminderCard = memo(function ReminderCard({
  icon,
  title,
  time,
  status = "scheduled",
  onComplete,
  onSkip,
  disabled
}: ReminderCardProps) {
  const { t } = useTranslation();
  const isDone = status === "completed";
  const isSkipped = status === "skipped";
  const isMissed = status === "missed";

  let statusClass = "border-elder-ink/15 bg-elder-surface";
  if (isDone) statusClass = "border-green-600/30 bg-green-50";
  if (isSkipped) statusClass = "border-gray-400/30 bg-gray-100 opacity-60";
  if (isMissed) statusClass = "border-red-600/30 bg-red-50";

  return (
    <article className={`flex flex-col sm:flex-row min-h-24 items-center gap-4 rounded-3xl border-2 px-5 py-4 ${statusClass}`}>
      <div className="flex items-center gap-4 flex-1 w-full">
        <span className={`text-4xl ${isDone ? 'text-green-600' : isMissed ? 'text-red-600' : 'text-elder-primary'}`} aria-hidden>
          {icon}
        </span>
        <div className="flex-1">
          <p className={`text-2xl font-semibold ${isDone || isSkipped ? 'line-through text-elder-muted' : ''}`}>
            {title}
          </p>
          {time && (
            <p className={`text-xl ${isMissed ? 'text-red-600 font-bold' : 'text-elder-muted'}`}>
              {time}
              {isMissed && ` (${t("reminders.statusMissed")})`}
            </p>
          )}
        </div>
      </div>
      
      {status === "scheduled" && (onComplete || onSkip) && (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={disabled}
              aria-label={t("reminders.actionSkip")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gray-200 px-6 py-4 text-xl font-bold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              <X size={24} /> {t("reminders.actionSkip")}
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              disabled={disabled}
              aria-label={t("reminders.actionDone")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-elder-primary px-6 py-4 text-xl font-bold text-elder-surface hover:bg-elder-primary/90 disabled:opacity-50 shadow-md"
            >
              <Check size={24} /> {t("reminders.actionDone")}
            </button>
          )}
        </div>
      )}
    </article>
  );
});

