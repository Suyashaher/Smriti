import { ElderlyButton } from "@/components/ElderlyButton";
import { useTranslation } from "@/hooks/useTranslation";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="rounded-3xl border-2 border-elder-accent bg-elder-surface p-8">
      <h2 className="text-3xl font-bold">{t("states.errorTitle")}</h2>
      <p className="mt-3 text-xl">{message ?? t("status.dbError")}</p>
      {onRetry ? (
        <div className="mt-6">
          <ElderlyButton onClick={onRetry}>{t("states.errorRetry")}</ElderlyButton>
        </div>
      ) : null}
    </div>
  );
}
