import en from "@/i18n/en.json";
import kh from "@/i18n/kh.json";
import type { LocaleCode } from "@/types";

type MessageTree = typeof en;

const catalogs: Record<LocaleCode, MessageTree> = {
  en,
  kh: kh as MessageTree,
};

/**
 * To add a new NER language (e.g., Assamese, Mizo, Manipuri):
 * 1. Create `src/i18n/<code>.json` with all keys from `en.json`
 * 2. Add the code to `LocaleCode` union in `src/types/index.ts`
 * 3. Import and register it in the `catalogs` record above
 * 4. Add a `language.<code>` entry to all locale files
 */

const _warnedKeys = new Set<string>();

export function translate(locale: LocaleCode, path: string): string {
  const parts = path.split(".");
  let node: unknown = catalogs[locale] ?? catalogs.en;
  for (const part of parts) {
    if (typeof node !== "object" || node === null || !(part in node)) {
      node = undefined;
      break;
    }
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node === "string") {
    return node;
  }
  // Fallback to English
  let fallback: unknown = catalogs.en;
  for (const part of parts) {
    if (typeof fallback !== "object" || fallback === null || !(part in fallback)) {
      if (import.meta.env.DEV && !_warnedKeys.has(path)) {
        _warnedKeys.add(path);
        console.warn(`[i18n] Missing translation key: "${path}" (locale: ${locale})`);
      }
      return path;
    }
    fallback = (fallback as Record<string, unknown>)[part];
  }
  if (typeof fallback === "string") {
    if (import.meta.env.DEV && locale !== "en" && !_warnedKeys.has(`${locale}:${path}`)) {
      _warnedKeys.add(`${locale}:${path}`);
      console.warn(`[i18n] Falling back to English for key: "${path}" (locale: ${locale})`);
    }
    return fallback;
  }
  return path;
}

export const supportedLocales: LocaleCode[] = ["en", "kh"];

export interface LanguageInfo {
  code: LocaleCode;
  nativeName: string;
  englishName: string;
}

export function getSupportedLanguages(): LanguageInfo[] {
  return [
    { code: "en", nativeName: "English", englishName: "English" },
    { code: "kh", nativeName: "Ka Ktien Khasi", englishName: "Khasi" },
  ];
}

