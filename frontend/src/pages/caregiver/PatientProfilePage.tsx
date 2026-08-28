import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsApi, type PatientAnalytics } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    async function fetchAnalytics() {
      const res = await analyticsApi.getPatientAnalytics(patientId!);
      if (cancelled) return;
      
      if (!res.ok) {
        setError(res.error || t("caregiver.errorFetchingAnalytics"));
        setLoading(false);
        return;
      }
      
      setData(res.data);
      setLoading(false);
    }
    
    void fetchAnalytics();
    return () => { cancelled = true; };
  }, [patientId, t]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || t("caregiver.analyticsNotFound")} onRetry={() => window.location.reload()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/caregiver/patients")}
          className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          aria-label={t("nav.back")}
        >
          ←
        </button>
        <h1 className="text-3xl font-bold">{data.patientName || data.patientId}</h1>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-elder-muted">{t("caregiver.overallStatus")}</p>
          <p className="mt-1 text-2xl font-bold capitalize">{t(`caregiver.status_${data.overallStatus}`)}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-elder-muted">{t("caregiver.lastAssessmentScore")}</p>
          <p className="mt-1 text-2xl font-bold">{data.lastAssessmentScore}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-elder-muted">{t("caregiver.gamesPlayed")}</p>
          <p className="mt-1 text-2xl font-bold">{data.gamesPlayed || 0}</p>
        </article>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">{t("caregiver.cognitiveTrend")}</h2>
        <div className="h-64 w-full">
          {data.cognitiveTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.cognitiveTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="linear" dataKey="score" stroke="#1B6B5A" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-elder-muted">
              {t("caregiver.noChartData")}
            </div>
          )}
        </div>
      </section>

      {Object.entries(data.gameTrends).map(([gameId, trendData]) => {
        // Convert 'memory_cards' into a camelCase string like 'memoryCards' to lookup in the translation dictionary
        const translationKey = gameId.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        
        return (
          <section key={gameId} className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">{t(`games.${translationKey}`)} Trend</h2>
            <div className="h-64 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="linear" dataKey="score" stroke="#2563EB" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-elder-muted">
                  {t("caregiver.noChartData")}
                </div>
              )}
            </div>
          </section>
        );
      })}
      
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">{t("caregiver.recentActivity")}</h2>
        {data.recentActivity.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {data.recentActivity.map((act, i) => {
              const translationKey = act.activity.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
              return (
                <li key={i} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{t(`games.${translationKey}`)}</p>
                      <p className="text-sm text-elder-muted">{new Date(act.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {act.score !== undefined && (
                        <p className="text-xl font-bold text-elder-primary">{act.score} pts</p>
                      )}
                    </div>
                  </div>
                  {(act.accuracy !== undefined || act.difficulty !== undefined) && (
                    <div className="mt-3 flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      {act.difficulty !== undefined && (
                        <p><span className="font-medium">Level:</span> {act.difficulty}</p>
                      )}
                      {act.accuracy !== undefined && (
                        <p><span className="font-medium">Accuracy:</span> {Math.round(act.accuracy * 100)}%</p>
                      )}
                      {act.responseTime !== undefined && (
                        <p><span className="font-medium">Time:</span> {(act.responseTime / 1000).toFixed(1)}s</p>
                      )}
                      {act.completed !== undefined && (
                        <p><span className="font-medium">Status:</span> {act.completed ? "Completed" : "Incomplete"}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-elder-muted">{t("caregiver.noRecentActivity")}</p>
        )}
      </section>
    </div>
  );
}
