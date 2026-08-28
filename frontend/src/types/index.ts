export type UserRole = "PATIENT" | "CAREGIVER" | "HEALTHCARE_WORKER" | "ADMIN";

export type LocaleCode = "en" | "kh";

export type AppMode = "elderly" | "caregiver";

export interface LocalSession {
  role: UserRole;
  patientId: string;
  displayName: string;
  isDemo: true;
}

export type SyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

export type GameId =
  | "memory_cards"
  | "object_recognition"
  | "pattern_recognition"
  | "daily_routine_recall"
  | "attention"
  | "story_memory"
  | "family_bonding";

export interface GameResult {
  id: string;
  patientId: string;
  gameId: GameId;
  score: number;
  accuracy: number;
  responseTime: number;
  attempts: number;
  difficulty: number;
  completed: boolean;
  timestamp: string;
  synced: boolean;
}

/** Dexie table row — same shape as the shared game result. */
export type GameResultRecord = GameResult;

export type RelationshipCode =
  | "MOTHER" | "FATHER" | "GRANDMOTHER" | "GRANDFATHER"
  | "BROTHER" | "SISTER" | "SON" | "DAUGHTER"
  | "GRANDSON" | "GRANDDAUGHTER" | "UNCLE" | "AUNT"
  | "COUSIN" | "SPOUSE" | "OTHER";

export interface FamilyMemberRecord {
  id: string;
  patientId: string;
  name: string;
  relation: RelationshipCode;
  nickname?: string;
  photoId?: string; // Reference to familyPhotos table
  active: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface FamilyPhotoRecord {
  id: string;
  familyMemberId: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

export interface DeviceMeta {
  key: "device";
  deviceId: string;
  lastSyncAt: string | null;
  appVersion: string;
  language: LocaleCode;
}

export type SyncEntityType =
  | "GAME_RESULT"
  | "REMINDER"
  | "REMINDER_EVENT"
  | "ROUTINE"
  | "PATIENT_SETTINGS"
  | "FAMILY_MEMBER";

export type SyncOperation = "CREATE" | "UPDATE" | "DELETE" | "UPSERT";

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  patientId: string;
  payload: unknown;
  status: SyncStatus;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  lastAttemptAt: string | null;
  error: string | null;
}

export interface SettingsRecord {
  key: "app";
  language: LocaleCode;
  voiceEnabled: boolean;
  speechOutputEnabled: boolean;
  speechInputEnabled: boolean;
  speechRate: number;
}

export interface GameDifficultyRecord {
  id: string;
  patientId: string;
  gameId: GameId;
  currentDifficulty: number;
  lastUpdated: string;
  performanceScore: number;
}

export type ReminderType = "medicine" | "hydration" | "meal" | "activity" | "appointment";

export type ReminderStatus = "scheduled" | "completed" | "skipped" | "missed";

export interface RecurrenceRule {
  frequency: "daily" | "weekly";
  daysOfWeek?: number[];
}

export interface ReminderRecord {
  id: string;
  patientId: string;
  type: ReminderType;
  titleKey: string;
  schedule: string;
  recurrence?: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderEventRecord {
  id: string;
  reminderId: string;
  patientId: string;
  scheduledAt: string;
  status: ReminderStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineTask {
  id: string;
  time: string;
  titleKey: string;
  icon: string;
  sortOrder: number;
  completedToday: boolean;
}

export interface RoutineRecord {
  id: string;
  patientId: string;
  items: RoutineTask[];
  createdAt: string;
  updatedAt: string;
}

// ─── Voice ──────────────────────────────────────────────

export type VoiceState =
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR"
  | "UNAVAILABLE";

export type VoiceCommandId =
  | "START_GAME"
  | "OPEN_GAMES"
  | "OPEN_ROUTINE"
  | "SHOW_REMINDERS"
  | "GO_HOME"
  | "REPEAT"
  | "HELP"
  | "GO_BACK";

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  offlineSpeechRecognition: boolean;
  offlineSpeechSynthesis: boolean;
  englishSTT: boolean;
  khasiSTT: boolean;
  englishTTS: boolean;
  khasiTTS: boolean;
}

