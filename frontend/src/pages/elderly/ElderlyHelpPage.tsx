import { Link } from "react-router-dom";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { useTranslation } from "@/hooks/useTranslation";

export function ElderlyHelpPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <ElderlyHeader title={t("help.title")} />
      <p className="text-2xl leading-relaxed">{t("help.body")}</p>
      
      <div className="mt-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-elder-muted uppercase tracking-wider">Device Pairing Code</h2>
        <div className="bg-gray-100 px-8 py-4 rounded-2xl">
          <span className="text-3xl font-mono font-bold text-elder-ink select-all">
            demo-patient-local
          </span>
        </div>
        <p className="text-center text-elder-muted">
          Give this code to your caregiver so they can monitor your progress from their dashboard.
        </p>
      </div>

      <div className="mt-8">
        <Link to="/">
          <ElderlyButton variant="secondary">{t("nav.switchMode")}</ElderlyButton>
        </Link>
      </div>
    </div>
  );
}
