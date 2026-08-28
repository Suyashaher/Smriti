import { Navigate, Route, Routes } from "react-router-dom";
import { RequireCaregiver, RequirePatient } from "@/components/RequireRole";
import { CaregiverLayout } from "@/layouts/CaregiverLayout";
import { ElderlyLayout } from "@/layouts/ElderlyLayout";
import { CaregiverDashboardPage } from "@/pages/caregiver/CaregiverDashboardPage";
import { CaregiverPlaceholderPage } from "@/pages/caregiver/CaregiverPlaceholderPage";
import { CaregiverSettingsPage } from "@/pages/caregiver/CaregiverSettingsPage";
import { PatientListPage } from "@/pages/caregiver/PatientListPage";
import { PatientProfilePage } from "@/pages/caregiver/PatientProfilePage";
import { CaregiverAlertsPage } from "@/pages/caregiver/CaregiverAlertsPage";
import { CaregiverRemindersPage } from "@/pages/caregiver/CaregiverRemindersPage";
import { CaregiverRoutinesPage } from "@/pages/caregiver/CaregiverRoutinesPage";
import { ElderlyAssistantPage } from "@/pages/elderly/ElderlyAssistantPage";
import { ElderlyGamesPage } from "@/pages/elderly/ElderlyGamesPage";
import { GamePlayPage } from "@/pages/elderly/GamePlayPage";
import { ElderlyHelpPage } from "@/pages/elderly/ElderlyHelpPage";
import { ElderlyHomePage } from "@/pages/elderly/ElderlyHomePage";
import { ElderlyProgressPage } from "@/pages/elderly/ElderlyProgressPage";
import { ElderlyRemindersPage } from "@/pages/elderly/ElderlyRemindersPage";
import { ElderlyRoutinePage } from "@/pages/elderly/ElderlyRoutinePage";
import { ModeSelectPage } from "@/pages/ModeSelectPage";
import { useConnectivityService } from "@/services/connectivityService";

import { CaregiverLoginPage } from "@/pages/caregiver/CaregiverLoginPage";
import { CaregiverFamilyPage } from "@/pages/caregiver/CaregiverFamilyPage";

export function App() {
  useConnectivityService();

  return (
    <Routes>
      <Route path="/" element={<ModeSelectPage />} />
      <Route path="/caregiver/login" element={<CaregiverLoginPage />} />
      <Route element={<RequirePatient />}>
        <Route path="/elderly" element={<ElderlyLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<ElderlyHomePage />} />
          <Route path="games" element={<ElderlyGamesPage />} />
          <Route path="games/:gameId" element={<GamePlayPage />} />
          <Route path="routine" element={<ElderlyRoutinePage />} />
          <Route path="reminders" element={<ElderlyRemindersPage />} />
          <Route path="progress" element={<ElderlyProgressPage />} />
          <Route path="assistant" element={<ElderlyAssistantPage />} />
          <Route path="help" element={<ElderlyHelpPage />} />
        </Route>
      </Route>
      <Route element={<RequireCaregiver />}>
        <Route path="caregiver" element={<CaregiverLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CaregiverDashboardPage />} />
          <Route path="patients" element={<PatientListPage />} />
          <Route path="patients/:patientId" element={<PatientProfilePage />} />
          <Route path="trends" element={<CaregiverPlaceholderPage titleKey="nav.trends" />} />
          <Route path="games" element={<CaregiverPlaceholderPage titleKey="nav.gameHistory" />} />
          <Route path="reminders" element={<CaregiverRemindersPage />} />
          <Route path="alerts" element={<CaregiverAlertsPage />} />
          <Route path="routines" element={<CaregiverRoutinesPage />} />
          <Route path="family" element={<CaregiverFamilyPage />} />
          <Route path="settings" element={<CaregiverSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
