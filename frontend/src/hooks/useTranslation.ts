import { useCallback } from "react";
import { useUiStore } from "@/store/uiStore";
import { translate } from "@/i18n";

export function useTranslation() {
  const locale = useUiStore((s) => s.locale);
  const t = useCallback((key: string) => translate(locale, key), [locale]);
  return { locale, t };
}
