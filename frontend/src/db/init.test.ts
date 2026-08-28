import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { initDatabase, persistLanguage } from "@/db/init";

describe("IndexedDB initialization", () => {
  afterEach(async () => {
    await db.delete();
  });

  it("opens Dexie and creates a device UUID", async () => {
    const meta = await initDatabase("en");
    expect(meta.key).toBe("device");
    expect(meta.deviceId.length).toBeGreaterThan(8);
    expect(meta.appVersion).toBeTruthy();
    expect(meta.lastSyncAt).toBeNull();
    expect(db.isOpen()).toBe(true);
  });

  it("reuses the same deviceId on a second init", async () => {
    const first = await initDatabase("en");
    const second = await initDatabase("kh");
    expect(second.deviceId).toBe(first.deviceId);
  });

  it("persists language to settings", async () => {
    await initDatabase("en");
    await persistLanguage("kh");
    const settings = await db.settings.get("app");
    expect(settings?.language).toBe("kh");
  });
});
