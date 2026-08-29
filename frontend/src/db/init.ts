import { db } from "@/db/database";
import type { DeviceMeta, LocaleCode, SettingsRecord } from "@/types";

export const APP_VERSION = "0.1.0";

function createDeviceId(): string {
  return crypto.randomUUID();
}

export async function initDatabase(
  preferredLanguage: LocaleCode = "en",
): Promise<DeviceMeta> {
  try {
    await db.open();
  } catch (error: any) {
    console.error("Dexie open failed:", error);
    // Dexie sometimes wraps errors or uses different names
    const errorName = error?.name || error?.inner?.name || "";
    if (
      errorName.includes('UnknownError') || 
      errorName.includes('DatabaseClosedError') || 
      errorName.includes('VersionError') ||
      String(error).includes('UnknownError')
    ) {
      console.warn("Attempting to delete and recreate corrupted database...");
      try {
        await db.delete();
        await db.open();
      } catch (retryError) {
        console.error("Dexie delete/reopen failed:", retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
  let device = await db.meta.get("device");
  if (!device) {
    device = {
      key: "device",
      deviceId: createDeviceId(),
      lastSyncAt: null,
      appVersion: APP_VERSION,
      language: preferredLanguage,
    };
    await db.meta.put(device);
  } else if (device.appVersion !== APP_VERSION) {
    device = { ...device, appVersion: APP_VERSION };
    await db.meta.put(device);
  }

  const settings = await db.settings.get("app");
  if (!settings) {
    const initial: SettingsRecord = {
      key: "app",
      language: device.language,
      voiceEnabled: false,
      speechOutputEnabled: true,
      speechInputEnabled: true,
      speechRate: 0.85,
    };
    await db.settings.put(initial);
  }

  return device;
}

export async function persistLanguage(language: LocaleCode): Promise<void> {
  const device = await db.meta.get("device");
  if (device) {
    await db.meta.put({ ...device, language });
  }
  const settings = await db.settings.get("app");
  if (settings) {
    await db.settings.put({ ...settings, language });
  } else {
    await db.settings.put({ key: "app", language, voiceEnabled: false, speechOutputEnabled: true, speechInputEnabled: true, speechRate: 0.85 });
  }
}
