import { supportedLocales } from "@/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { useUiStore } from "@/store/uiStore";
import type { LocaleCode } from "@/types";

interface LanguageSelectorProps {
  large?: boolean;
}

export function LanguageSelector({ large = true }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 text-xl font-semibold">{t("mode.chooseLanguage")}</legend>
      <div className="flex flex-wrap gap-3">
        {supportedLocales.map((code: LocaleCode) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              void setLocale(code);
            }}
            aria-pressed={locale === code}
            className={`min-h-16 min-w-36 rounded-2xl border-2 px-5 text-xl font-semibold ${
              locale === code
                ? "border-elder-primary bg-elder-primary text-white"
                : "border-elder-ink/30 bg-elder-surface"
            } ${large ? "min-h-20 text-2xl" : ""}`}
          >
            {t(`language.${code}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
