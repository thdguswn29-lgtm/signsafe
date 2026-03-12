"use client";

import { useLanguage } from "@/app/context/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex rounded-full border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-medium text-slate-600"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === "en"
            ? "bg-white text-slate-900 shadow-sm"
            : "hover:bg-slate-100 hover:text-slate-800"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ko")}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === "ko"
            ? "bg-white text-slate-900 shadow-sm"
            : "hover:bg-slate-100 hover:text-slate-800"
        }`}
        aria-pressed={locale === "ko"}
      >
        KO
      </button>
    </div>
  );
}
