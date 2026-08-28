import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface ElderlyHeaderProps {
  title: string;
  trailing?: ReactNode;
}

export function ElderlyHeader({ title, trailing }: ElderlyHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex items-start justify-between gap-4 pb-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-elder-primary">
          {t("app.name")}
        </p>
        <h1 className="text-4xl font-bold leading-tight text-elder-ink">{title}</h1>
      </div>
      {trailing}
    </header>
  );
}
