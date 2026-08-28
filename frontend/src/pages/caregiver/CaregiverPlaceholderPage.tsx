import { EmptyState } from "@/components/states/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";

interface CaregiverPlaceholderPageProps {
  titleKey: string;
}

export function CaregiverPlaceholderPage({ titleKey }: CaregiverPlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t(titleKey)}</h1>
      <EmptyState title={t("caregiver.placeholder")}>{t("caregiver.noPatients")}</EmptyState>
    </div>
  );
}
