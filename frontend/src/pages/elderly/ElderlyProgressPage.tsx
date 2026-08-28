import { useEffect, useState } from "react";
import { ElderlyCard } from "@/components/ElderlyCard";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { ProgressCard } from "@/components/ProgressCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameStore } from "@/store/gameStore";
import { useSessionStore } from "@/store/sessionStore";
import {
  getPatientPerformance,
  GAME_KEYS,
  type PatientPerformance,
} from "@/services/patientPerformance";
import type { ActivityTrend } from "@engine";
import type { GameId } from "@/types";

const GAME_LABELS: Record<GameId, string> = {
  memory_cards: "games.memoryCards",
  object_recognition: "games.objectRecognition",
  pattern_recognition: "games.patternRecognition",
  daily_routine_recall: "games.routineRecall",
  attention: "games.attention",
  story_memory: "games.storyMemory",
  family_bonding: "games.familyBonding",
};

const TREND_MESSAGES: Record<ActivityTrend, string> = {
  improving: "progress.trendImproving",
  stable: "progress.trendStable",
  declining: "progress.trendDeclining",
  insufficient_data: "progress.trendInsufficient",
};

const DIFFICULTY_EMOJI: Record<number, string> = {
  1: "🟢",
  2: "🟡",
  3: "🔴",
};

export function ElderlyProgressPage() {
  const { t } = useTranslation();
  const patientId = useSessionStore((s) => s.session?.patientId);
  const recentResults = useGameStore((s) => s.recentResults);
  const loadRecent = useGameStore((s) => s.loadRecent);
  const [perf, setPerf] = useState<PatientPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      const [perfData] = await Promise.all([
        getPatientPerformance(patientId!),
        loadRecent(patientId!),
      ]);
      if (!cancelled) {
        setPerf(perfData);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [patientId, loadRecent]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <ElderlyHeader title={t("progress.title")} />
        <LoadingState />
      </div>
    );
  }

  const hasData = perf && perf.gamesPlayed > 0;

  return (
    <div className="flex flex-col gap-4">
      <ElderlyHeader title={t("progress.title")} />
      <p className="text-lg text-elder-muted">{t("caregiver.nonClinicalNote")}</p>

      {!hasData ? (
        <EmptyState title={t("progress.empty")} />
      ) : (
        <>
          {/* Trend message — friendly, not medical */}
          <ElderlyCard>
            <p className="text-2xl leading-relaxed">
              {t(TREND_MESSAGES[perf.recentTrend])}
            </p>
          </ElderlyCard>

          {/* Overall summary */}
          <div className="grid grid-cols-2 gap-3">
            <ProgressCard
              label={t("progress.overallLabel")}
              value={perf.overallScore}
            />
            <ProgressCard
              label={t("progress.gamesPlayedLabel")}
              value={perf.gamesPlayed}
            />
          </div>

          {/* Per-game breakdown */}
          <h2 className="mt-2 text-2xl font-semibold">{t("progress.perGameTitle")}</h2>
          <ul className="flex flex-col gap-3">
            {(Object.keys(GAME_KEYS) as GameId[]).map((gid) => {
              const key = GAME_KEYS[gid];
              const slice = perf.gamePerformance[key];
              if (slice.sessions === 0) return null;
              return (
                <li
                  key={gid}
                  className="flex items-center justify-between rounded-3xl bg-elder-surface p-5"
                >
                  <div>
                    <p className="text-xl font-semibold">{t(GAME_LABELS[gid])}</p>
                    <p className="text-lg text-elder-muted">
                      {slice.sessions} {t("progress.sessions")} {DIFFICULTY_EMOJI[slice.difficulty] ?? ""}
                    </p>
                  </div>
                  <p className="text-3xl font-bold">{slice.performanceScore}</p>
                </li>
              );
            })}
          </ul>

          {/* Recent history */}
          {recentResults.length > 0 ? (
            <>
              <h2 className="mt-2 text-2xl font-semibold">{t("progress.recentHistory")}</h2>
              <ul className="flex flex-col gap-2">
                {recentResults.slice(0, 10).map((result) => (
                  <li key={result.id} className="rounded-3xl bg-elder-surface p-4 text-xl">
                    <p className="font-semibold">{t(GAME_LABELS[result.gameId])}</p>
                    <p className="text-elder-muted">{t("play.activityLogged")}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

