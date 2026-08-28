import { NavLink, Outlet } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useTranslation } from "@/hooks/useTranslation";

const links = [
  { to: "/caregiver/dashboard", key: "nav.dashboard" },
  { to: "/caregiver/patients", key: "nav.patients" },
  { to: "/caregiver/family", key: "nav.family" },
  { to: "/caregiver/trends", key: "nav.trends" },
  { to: "/caregiver/games", key: "nav.gameHistory" },
  { to: "/caregiver/reminders", key: "nav.reminders" },
  { to: "/caregiver/alerts", key: "nav.alerts" },
  { to: "/caregiver/routines", key: "nav.routines" },
  { to: "/caregiver/settings", key: "nav.settings" },
] as const;

export function CaregiverLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-care-bg text-care-ink">
      <header className="border-b border-black/10 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-elder-primary">
              {t("app.name")}
            </p>
            <p className="text-lg text-elder-muted">{t("caregiver.nonClinicalNote")}</p>
          </div>
          <SyncStatusIndicator />
        </div>
        <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-2" aria-label={t("nav.dashboard")}>
          {links.map(({ to, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `min-h-12 rounded-xl px-4 py-3 text-lg font-semibold ${
                  isActive ? "bg-elder-primary text-white" : "bg-care-bg text-care-ink"
                }`
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 max-w-xl">
          <LanguageSelector large={false} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
