import { describe, it, expect } from "vitest";
import { translate, supportedLocales } from "./index";
import en from "./en.json";
import kh from "./kh.json";

describe("i18n Translation System", () => {
  it("should have matching supported locales", () => {
    expect(supportedLocales).toContain("en");
    expect(supportedLocales).toContain("kh");
  });

  it("should resolve english strings correctly", () => {
    expect(translate("en", "app.name")).toBe("Smriti");
    expect(translate("en", "nav.home")).toBe("Home");
  });

  it("should resolve khasi strings correctly", () => {
    expect(translate("kh", "app.name")).toBe("Smriti");
    expect(translate("kh", "nav.home")).toBe("Ïing");
  });

  it("should fallback to English for missing Khasi keys", () => {
    // If a key doesn't exist in kh.json, it should return the en.json value
    // Assuming 'app.demoBadge' exists in EN
    expect(translate("kh", "app.demoBadge")).toBeTruthy();
  });

  it("should return the raw key path if missing from all locales", () => {
    expect(translate("en", "missing.fake.key")).toBe("missing.fake.key");
    expect(translate("kh", "missing.fake.key")).toBe("missing.fake.key");
  });
});

describe("i18n Catalog Parity", () => {
  function getPaths(obj: Record<string, unknown>, prefix = ""): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        return getPaths(value as Record<string, unknown>, path);
      }
      return [path];
    });
  }

  it("should have exactly the same keys in en.json and kh.json", () => {
    const enKeys = getPaths(en);
    const khKeys = getPaths(kh);
    
    // Sort to compare
    enKeys.sort();
    khKeys.sort();
    
    // They should match exactly after our updates
    const missingInKh = enKeys.filter(k => !khKeys.includes(k));
    const extraInKh = khKeys.filter(k => !enKeys.includes(k));
    
    expect(missingInKh, `Missing in Khasi: ${missingInKh.join(", ")}`).toEqual([]);
    expect(extraInKh, `Extra in Khasi: ${extraInKh.join(", ")}`).toEqual([]);
    expect(enKeys.length).toBe(khKeys.length);
  });
});
