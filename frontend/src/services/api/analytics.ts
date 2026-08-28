import { getPatientPerformance } from "../patientPerformance";
import { listGameResults } from "@/db/gameResults";
import { analyzePerformance } from "@engine";
import { toSessionInput } from "@/services/adaptivePlay";
import type { GameId } from "@/types";

export interface CognitiveTrend {
  date: string;
  score: number;
}

export interface AdherenceTrend {
  date: string;
  adherencePercentage: number;
}

export interface RecentActivity {
  activity: string;
  timestamp: string;
  score?: number;
  accuracy?: number;
  responseTime?: number;
  difficulty?: number;
  completed?: boolean;
}

export interface PatientAnalytics {
  patientId: string;
  patientName: string;
  cognitiveTrends: CognitiveTrend[];
  gameTrends: Record<string, CognitiveTrend[]>;
  adherenceTrends: AdherenceTrend[];
  recentActivity: RecentActivity[];
  overallStatus: "stable" | "needs_attention" | "critical";
  lastAssessmentScore: number;
  gamesPlayed: number;
}

export const analyticsApi = {
  getPatientAnalytics: async (patientId: string) => {
    // Intercept API call to use local IndexedDB data for instant demo visibility
    try {
      const perf = await getPatientPerformance(patientId);
      const allGames = await listGameResults(patientId, 50);
      
      const sortedGames = [...allGames].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      // Do not group by day; plot every individual game session sequentially
      const overallTrends: CognitiveTrend[] = [];
      const gameTrends: Record<string, CognitiveTrend[]> = {};

      sortedGames.forEach((g, index) => {
        const timeLabel = new Date(g.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const shortDate = g.timestamp.split("T")[0].slice(-5); // e.g. "08-27"
        const label = `${shortDate} ${timeLabel}`;
        
        // Add to overall trend
        const analysis = analyzePerformance(g.gameId as GameId, sortedGames.slice(0, index + 1).map(toSessionInput));
        overallTrends.push({
          date: label,
          score: analysis.cognitivePerformanceScore
        });

        // Add to specific game trend
        if (!gameTrends[g.gameId]) gameTrends[g.gameId] = [];
        
        const gamesOfThisTypeSoFar = sortedGames.slice(0, index + 1).filter(prev => prev.gameId === g.gameId);
        const specificAnalysis = analyzePerformance(g.gameId as GameId, gamesOfThisTypeSoFar.map(toSessionInput));
        
        gameTrends[g.gameId].push({
          date: label,
          score: specificAnalysis.cognitivePerformanceScore
        });
      });

      const mapped: PatientAnalytics = {
        patientId,
        patientName: patientId,
        overallStatus: perf.recentTrend === "declining" ? "needs_attention" : "stable",
        lastAssessmentScore: perf.overallScore,
        gamesPlayed: perf.gamesPlayed,
        cognitiveTrends: overallTrends,
        gameTrends,
        adherenceTrends: [], // Demodata doesn't easily have adherence here unless we query reminders
        recentActivity: sortedGames.slice(-10).reverse().map(g => ({
          activity: g.gameId,
          timestamp: g.timestamp,
          score: g.score,
          accuracy: g.accuracy,
          responseTime: g.responseTime,
          difficulty: g.difficulty,
          completed: g.completed
        }))
      };
      
      return { ok: true, data: mapped, error: null, status: 200 };
    } catch (e) {
      return { ok: false, error: String(e), data: null, status: 500 };
    }
  },
};
