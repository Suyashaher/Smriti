import type { ReactNode } from "react";

interface ElderlyCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ElderlyCard({ children, className = "", onClick }: ElderlyCardProps) {
  const shared = `rounded-3xl border-2 border-elder-ink/15 bg-elder-surface p-6 shadow-sm ${className}`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${shared} w-full text-left`}>
        {children}
      </button>
    );
  }
  return <section className={shared}>{children}</section>;
}
