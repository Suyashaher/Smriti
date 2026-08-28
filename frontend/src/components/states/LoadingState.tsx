import { useTranslation } from "@/hooks/useTranslation";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-4 p-8">
      <div className="h-12 w-12 rounded-full border-4 border-elder-ink/20 border-t-elder-primary" />
      <p className="text-2xl font-medium">{message ?? t("states.loading")}</p>
    </div>
  );
}
