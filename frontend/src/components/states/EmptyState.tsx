import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface EmptyStateProps {
  title?: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl border-2 border-dashed border-elder-ink/25 bg-elder-surface/60 p-8 text-center">
      <p className="text-2xl font-semibold">{title ?? t("states.emptyDefault")}</p>
      {children ? <div className="mt-3 text-xl text-elder-muted">{children}</div> : null}
    </div>
  );
}
