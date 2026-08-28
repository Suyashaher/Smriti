import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { GameShell } from "@/games/GameShell";
import { buildGameResult, shuffle } from "@/games/scoring";
import type { GameShellPhase, GameResult } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameVoice } from "@/hooks/useGameVoice";
import { familyDb } from "@/db/familyMembers";
import type { FamilyMemberRecord, RelationshipCode } from "@/types";

export function FamilyBondingGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("family_bonding");
  const { markStart, elapsedSeconds } = useGameTimer();
  const { speakInstruction, speakFeedback, stopSpeaking } = useGameVoice();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [step, setStep] = useState<"prerequisite" | "name" | "relation">("name");
  
  const [allMembers, setAllMembers] = useState<FamilyMemberRecord[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  
  const [currentMember, setCurrentMember] = useState<FamilyMemberRecord | null>(null);
  const [nameChoices, setNameChoices] = useState<string[]>([]);
  const [relationChoices, setRelationChoices] = useState<RelationshipCode[]>([]);
  
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [targetRounds, setTargetRounds] = useState(2);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);

  // Load family members on mount
  useEffect(() => {
    if (!patientId) return;
    
    async function loadMembers() {
      const activeMembers = await familyDb.getActiveFamilyMembers(patientId!);
      setAllMembers(activeMembers);
      
      if (activeMembers.length < 3) {
        setStep("prerequisite");
      }
      
      // Load photos
      const urls: Record<string, string> = {};
      for (const m of activeMembers) {
        if (m.photoId) {
          const url = await familyDb.getPhotoUrl(m.photoId);
          if (url) urls[m.id] = url;
        }
      }
      setPhotoUrls(urls);
    }
    
    void loadMembers();
  }, [patientId]);

  const setupRound = useCallback(() => {
    if (allMembers.length < 3) return;
    
    // Rounds and choices based on difficulty (1-10)
    let rounds = 2;
    let choicesCount = 2;
    
    if (difficulty > 3 && difficulty <= 7) {
      rounds = 3;
      choicesCount = 3;
    } else if (difficulty > 7) {
      rounds = 4;
      choicesCount = 4;
    }
    
    setTargetRounds(Math.min(rounds, allMembers.length)); // Can't play more rounds than members
    setRoundsPlayed(0);
    setCorrectCount(0);
    setAttempts(0);
    
    // Pick first member
    nextRound(0, choicesCount);
  }, [difficulty, allMembers]);

  const nextRound = (currentRoundIdx: number, choicesCount: number) => {
    const shuffledMembers = shuffle([...allMembers]);
    const target = shuffledMembers[currentRoundIdx % shuffledMembers.length];
    setCurrentMember(target);
    
    // Generate name choices
    const distractorNames = shuffledMembers
      .filter(m => m.id !== target.id)
      .map(m => m.name);
    const selectedDistractorNames = shuffle(distractorNames).slice(0, choicesCount - 1);
    setNameChoices(shuffle([target.name, ...selectedDistractorNames]));
    
    // Generate relation choices
    // We import RELATIONSHIPS or just define them
    const allRelations: RelationshipCode[] = [
      "MOTHER", "FATHER", "GRANDMOTHER", "GRANDFATHER",
      "BROTHER", "SISTER", "SON", "DAUGHTER",
      "GRANDSON", "GRANDDAUGHTER", "UNCLE", "AUNT",
      "COUSIN", "SPOUSE", "OTHER"
    ];
    const distractorRelations = allRelations.filter(r => r !== target.relation);
    const selectedDistractorRelations = shuffle(distractorRelations).slice(0, choicesCount - 1);
    setRelationChoices(shuffle([target.relation, ...selectedDistractorRelations]));
    
    setStep("name");
    
    if (currentRoundIdx === 0) {
      markStart();
      speakInstruction("play.familyWhoIs");
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  async function persist(result: GameResult): Promise<void> {
    setPending(result);
    setPhase("saving");
    const stored = await saveResult(result);
    if (stored) {
      setSaved(stored);
      setPhase("done");
    } else {
      setPhase("error");
    }
  }

  function finishGame(finalCorrect: number, finalAttempts: number): void {
    if (!patientId) return;
    const result = buildGameResult({
      patientId,
      gameId: "family_bonding",
      score: finalCorrect,
      correct: finalCorrect,
      attempts: finalAttempts,
      responseTime: elapsedSeconds(),
      difficulty,
      completed: true,
    });
    void persist(result);
  }

  const handleNameAnswer = (selectedName: string) => {
    if (!currentMember) return;
    
    const isCorrect = selectedName === currentMember.name;
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      speakFeedback("correct");
    } else {
      speakFeedback("tryAgain");
    }
    
    setTimeout(() => {
      setStep("relation");
      speakInstruction("play.familyRelation");
    }, 1000);
  };

  const handleRelationAnswer = (selectedRelation: RelationshipCode) => {
    if (!currentMember) return;
    
    const isCorrect = selectedRelation === currentMember.relation;
    const newAttempts = attempts + 1;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    
    setAttempts(newAttempts);
    
    if (isCorrect) {
      setCorrectCount(newCorrect);
      speakFeedback("correct");
    } else {
      speakFeedback("tryAgain");
    }
    
    const nextRoundIdx = roundsPlayed + 1;
    
    setTimeout(() => {
      if (nextRoundIdx < targetRounds) {
        setRoundsPlayed(nextRoundIdx);
        
        let choicesCount = 2;
        if (difficulty > 3 && difficulty <= 7) choicesCount = 3;
        else if (difficulty > 7) choicesCount = 4;
        
        nextRound(nextRoundIdx, choicesCount);
      } else {
        finishGame(newCorrect, newAttempts);
      }
    }, 1000);
  };

  return (
    <GameShell
      title={t("games.familyBonding")}
      instruction={t("play.familyIntro")}
      instructionKey="play.familyIntro"
      phase={phase}
      result={saved}
      saveError={saveError}
      encouragement={lastRecommendation}
      preparing={!difficultyReady}
      onStart={() => {
        if (allMembers.length < 3) {
          setPhase("playing");
          return;
        }
        setupRound();
        setPhase("playing");
      }}
      onPlayAgain={() => {
        setSaved(null);
        setPending(null);
        setupRound();
        setPhase("playing");
      }}
      onRetrySave={() => {
        if (pending) void persist(pending);
      }}
    >
      {step === "prerequisite" && (
        <ElderlyCard>
          <div className="text-center p-8">
            <h2 className="text-3xl font-bold mb-6">{t("games.familyBonding")}</h2>
            <p className="text-2xl text-elder-muted leading-relaxed mb-8">
              {t("play.familyNeedMore")}
            </p>
            <ElderlyButton variant="secondary" onClick={() => navigate("/elderly/games")}>
              {t("play.backToGames")}
            </ElderlyButton>
          </div>
        </ElderlyCard>
      )}

      {phase === "playing" && currentMember && step !== "prerequisite" && (
        <ElderlyCard>
          <div className="flex flex-col gap-8 items-center">
            
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-gray-200 shadow-lg border-4 border-white flex-shrink-0">
              {photoUrls[currentMember.id] ? (
                <img src={photoUrls[currentMember.id]} alt="Family Member" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">?</div>
              )}
            </div>
            
            {step === "name" ? (
              <div className="w-full flex flex-col gap-6">
                <h3 className="text-3xl font-bold text-center">{t("play.familyWhoIs")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                  {nameChoices.map(name => (
                    <button
                      key={name}
                      onClick={() => handleNameAnswer(name)}
                      className="p-6 text-2xl font-semibold bg-elder-bg hover:bg-elder-primary/10 border-4 border-elder-ink/10 rounded-2xl transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-6">
                <h3 className="text-3xl font-bold text-center">{t("play.familyRelation")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                  {relationChoices.map(rel => (
                    <button
                      key={rel}
                      onClick={() => handleRelationAnswer(rel)}
                      className="p-6 text-2xl font-semibold bg-elder-bg hover:bg-elder-primary/10 border-4 border-elder-ink/10 rounded-2xl transition-colors"
                    >
                      {t(`relation.${rel}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </ElderlyCard>
      )}
    </GameShell>
  );
}
