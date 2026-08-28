import { useEffect, useState } from "react";
import { alertsApi, type Alert } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";

export function CaregiverAlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAlerts() {
      const res = await alertsApi.getAlerts();
      if (cancelled) return;
      
      if (!res.ok) {
        setError(res.error || t("caregiver.errorFetchingAlerts"));
        setLoading(false);
        return;
      }
      
      setAlerts(res.data || []);
      setLoading(false);
    }
    
    void fetchAlerts();
    return () => { cancelled = true; };
  }, [t]);

  const handleAcknowledge = async (id: string) => {
    const res = await alertsApi.acknowledgeAlert(id);
    if (res.ok) {
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isAcknowledged: true } : a));
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const unacknowledged = alerts.filter(a => !a.isAcknowledged);
  const grouped = {
    critical: unacknowledged.filter(a => a.severity === "critical"),
    high: unacknowledged.filter(a => a.severity === "high"),
    medium: unacknowledged.filter(a => a.severity === "medium"),
    low: unacknowledged.filter(a => a.severity === "low"),
  };

  if (unacknowledged.length === 0) return <EmptyState title={t("caregiver.noAlerts")} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{t("caregiver.alertsTitle")}</h1>
      
      <div className="flex flex-col gap-8">
        {(Object.entries(grouped) as [Alert["severity"], Alert[]][]).map(([severity, severAlerts]) => {
          if (severAlerts.length === 0) return null;
          
          return (
            <section key={severity}>
              <h2 className="mb-4 text-xl font-semibold capitalize text-elder-muted">
                {t(`caregiver.severity_${severity}`)} ({severAlerts.length})
              </h2>
              <div className="flex flex-col gap-3">
                {severAlerts.map(alert => (
                  <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                    <div>
                      <p className="font-semibold">{alert.patientName}</p>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-elder-muted mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="mt-3 sm:mt-0 rounded-full bg-elder-primary px-4 py-2 text-sm font-semibold text-white hover:bg-elder-accent"
                    >
                      {t("caregiver.acknowledge")}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
