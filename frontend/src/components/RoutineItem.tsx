import { memo } from "react";
import { CheckSquare, Square } from "lucide-react";

interface RoutineItemProps {
  time: string;
  title: string;
  completed?: boolean;
  onToggle?: (completed: boolean) => void;
  disabled?: boolean;
}

export const RoutineItem = memo(function RoutineItem({ time, title, completed = false, onToggle, disabled }: RoutineItemProps) {
  return (
    <article 
      className={`flex min-h-24 items-center gap-4 rounded-3xl border-2 px-5 py-4 cursor-pointer transition-colors ${
        completed ? "border-elder-ink/10 bg-elder-surface/50 opacity-70" : "border-elder-ink/15 bg-elder-surface"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => onToggle && onToggle(!completed)}
    >
      <div className="text-elder-primary shrink-0">
        {completed ? <CheckSquare size={48} /> : <Square size={48} />}
      </div>
      <time className="w-24 shrink-0 text-2xl font-bold text-elder-primary">{time}</time>
      <p className={`text-2xl font-semibold flex-1 ${completed ? "text-elder-muted line-through" : ""}`}>
        {title}
      </p>
    </article>
  );
});

