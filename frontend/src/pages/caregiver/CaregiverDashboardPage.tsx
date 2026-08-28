import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { caregiverApi, alertsApi, type PatientSummary, type Alert } from "@/services/api";
import { authApi } from "@/services/api/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";

export function CaregiverDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const caregiverId = authApi.getCaregiverId();
      if (!caregiverId) return;

      const [patientsRes, alertsRes] = await Promise.all([
        caregiverApi.getPatients(caregiverId),
        alertsApi.getAlerts()
      ]);

      if (cancelled) return;

      if (!patientsRes.ok) {
        setError(patientsRes.error || t("caregiver.errorFetchingDashboard"));
      } else {
        setPatients(patientsRes.data || []);
      }

      if (alertsRes.ok) {
        setAlerts(alertsRes.data || []);
      }

      setLoading(false);
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const unacknowledgedAlerts = alerts.filter(a => !a.isAcknowledged);
  const patientsNeedingAttention = patients.filter(p => p.status !== "stable");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{t("caregiver.dashboardTitle")}</h1>
      <p className="text-sm text-elder-muted">{t("caregiver.nonClinicalNote")}</p>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article 
          className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50"
          onClick={() => navigate("/caregiver/patients")}
        >
          <p className="text-sm text-elder-muted">{t("caregiver.totalPatients")}</p>
          <p className="mt-1 text-4xl font-bold">{patients.length}</p>
        </article>
        <article 
          className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50"
          onClick={() => navigate("/caregiver/alerts")}
        >
          <p className="text-sm text-elder-muted">{t("caregiver.activeAlerts")}</p>
          <p className="mt-1 text-4xl font-bold text-red-600">{unacknowledgedAlerts.length}</p>
        </article>
        <article 
          className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50"
          onClick={() => navigate("/caregiver/patients")}
        >
          <p className="text-sm text-elder-muted">{t("caregiver.needsAttention")}</p>
          <p className="mt-1 text-4xl font-bold text-yellow-600">{patientsNeedingAttention.length}</p>
        </article>
      </div>

      {/* Attention Required Section */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("caregiver.attentionRequired")}</h2>
          <button 
            className="text-sm font-medium text-elder-primary hover:underline"
            onClick={() => navigate("/caregiver/patients")}
          >
            {t("nav.viewAll")}
          </button>
        </div>
        
        {patientsNeedingAttention.length > 0 ? (
          <div className="flex flex-col gap-3">
            {patientsNeedingAttention.map(p => (
              <div 
                key={p.id} 
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/caregiver/patients/${p.id}`)}
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-elder-muted">{t(`caregiver.status_${p.status}`)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.status === "critical" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {t(`caregiver.status_${p.status}`)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-elder-muted">{t("caregiver.allPatientsStable")}</p>
        )}
      </section>
      
      {/* Recent Alerts Section */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
         <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("caregiver.recentAlerts")}</h2>
          <button 
            className="text-sm font-medium text-elder-primary hover:underline"
            onClick={() => navigate("/caregiver/alerts")}
          >
            {t("nav.viewAll")}
          </button>
        </div>
        
        {unacknowledgedAlerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {unacknowledgedAlerts.slice(0, 3).map(alert => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 cursor-pointer hover:bg-red-100"
                onClick={() => navigate("/caregiver/alerts")}
              >
                <div>
                  <p className="font-semibold text-red-900">{alert.patientName}</p>
                  <p className="text-sm text-red-800">{alert.message}</p>
                </div>
                <span className="text-xs font-medium text-red-700">
                  {t(`caregiver.severity_${alert.severity}`)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-elder-muted">{t("caregiver.noActiveAlerts")}</p>
        )}
      </section>
    </div>
  );
}

