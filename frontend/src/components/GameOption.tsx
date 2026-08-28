import { memo, type ReactNode } from "react";

interface GameOptionProps {
  icon: ReactNode;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export const GameOption = memo(function GameOption({ icon, label, onSelect, disabled }: GameOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="flex min-h-28 w-full items-center gap-5 rounded-3xl border-2 border-elder-ink/20 bg-elder-surface px-5 py-4 text-left text-2xl font-semibold text-elder-ink shadow-sm disabled:opacity-70"
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-elder-primary text-white">
        {icon}
      </span>
      {label}
    </button>
  );
});
