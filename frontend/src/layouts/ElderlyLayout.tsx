import { NavLink, Outlet } from "react-router-dom";
import {
  Brain,
  Calendar,
  CircleHelp,
  Clock,
  Home,
  Mic,
  TrendingUp,
} from "lucide-react";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { ActiveReminderModal } from "@/components/ActiveReminderModal";
import { useTranslation } from "@/hooks/useTranslation";

const items = [
  { to: "/elderly/home", key: "nav.home", icon: Home },
  { to: "/elderly/games", key: "nav.games", icon: Brain },
  { to: "/elderly/routine", key: "nav.routine", icon: Calendar },
  { to: "/elderly/reminders", key: "nav.reminders", icon: Clock },
  { to: "/elderly/progress", key: "nav.progress", icon: TrendingUp },
  { to: "/elderly/assistant", key: "nav.assistant", icon: Mic },
  { to: "/elderly/help", key: "nav.help", icon: CircleHelp },
] as const;

export function ElderlyLayout() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-elder-bg text-elder-ink">
      <ActiveReminderModal />
      <div className="px-4 pt-4">
        <SyncStatusIndicator />
      </div>
      <main className="flex-1 overflow-auto px-4 py-4 pb-40">
        <Outlet />
      </main>
      <nav
        aria-label={t("nav.home")}
        className="fixed bottom-0 left-0 right-0 border-t-2 border-elder-ink/15 bg-elder-surface"
      >
        <ul className="mx-auto flex max-w-lg gap-1 overflow-x-auto p-2">
          {items.map(({ to, key, icon: Icon }) => (
            <li key={to} className="min-w-20 flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex min-h-20 flex-col items-center justify-center rounded-xl px-2 text-center text-sm font-semibold ${
                    isActive ? "bg-elder-primary text-white" : "text-elder-ink"
                  }`
                }
              >
                <Icon size={28} aria-hidden />
                <span className="mt-1 leading-tight">{t(key)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
