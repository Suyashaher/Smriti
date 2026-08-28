import { useNavigate } from "react-router-dom";
import { ElderlyButton } from "@/components/ElderlyButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";

export function ModeSelectPage() {
  const { t } = useTranslation();
  const setRole = useSessionStore((s) => s.setRole);
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-8 bg-elder-bg px-5 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-elder-primary">{t("app.name")}</h1>
        <p className="mt-2 text-lg text-elder-muted">{t("app.subtitle")}</p>
      </header>
      <p className="mt-4 rounded-2xl bg-white/70 p-4 text-lg text-elder-muted">{t("app.disclaimer")}</p>
      <LanguageSelector />
      <h2 className="text-3xl font-bold">{t("mode.title")}</h2>
      <ElderlyButton
        onClick={() => {
          setRole("PATIENT");
          void navigate("/elderly/home");
        }}
      >
        {t("mode.patient")}
      </ElderlyButton>
      <ElderlyButton
        variant="secondary"
        onClick={() => {
          setRole("CAREGIVER");
          void navigate("/caregiver/dashboard");
        }}
      >
        {t("mode.caregiver")}
      </ElderlyButton>
    </div>
  );
}
