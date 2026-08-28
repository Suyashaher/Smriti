import Dexie, { type Table } from "dexie";
import type {
  DeviceMeta,
  GameDifficultyRecord,
  GameResultRecord,
  SettingsRecord,
  SyncQueueItem,
  ReminderRecord,
  ReminderEventRecord,
  RoutineRecord,
  FamilyMemberRecord,
  FamilyPhotoRecord,
} from "@/types";


export class EldercareDatabase extends Dexie {
  meta!: Table<DeviceMeta, string>;
  gameResults!: Table<GameResultRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  reminders!: Table<ReminderRecord, string>;
  reminderEvents!: Table<ReminderEventRecord, string>;
  routines!: Table<RoutineRecord, string>;
  settings!: Table<SettingsRecord, string>;
  gameDifficulty!: Table<GameDifficultyRecord, string>;
  familyMembers!: Table<FamilyMemberRecord, string>;
  familyPhotos!: Table<FamilyPhotoRecord, string>;

  constructor() {
    super("eldercare_offline");
    this.version(1).stores({
      meta: "key, deviceId",
      gameResults: "id, patientId, gameId, timestamp, synced",
      syncQueue: "id, patientId, status, timestamp, type",
      reminders: "id, patientId",
      reminderEvents: "id, reminderId, patientId, scheduledAt, status",
      routines: "id, patientId",
      settings: "key",
    });
    this.version(2).stores({
      gameDifficulty: "id, patientId, gameId",
    });
    this.version(3).stores({
      syncQueue: "id, entityType, entityId, operation, patientId, status, createdAt, retryCount",
    });
    this.version(4).stores({
      familyMembers: "id, patientId, relation, active",
      familyPhotos: "id, familyMemberId",
    });
    this.version(5).stores({
      reminderEvents: "id, reminderId, patientId, scheduledAt, status, [patientId+scheduledAt]",
    });
  }
}

export const db = new EldercareDatabase();
