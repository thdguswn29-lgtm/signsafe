"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "../context/analysis-context";
import { useLanguage } from "../context/language-context";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import SignSafeLogo from "../components/SignSafeLogo";
import { AnalysisResultsView } from "../components/AnalysisResultsView";

export default function ResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { result } = useAnalysis();

  useEffect(() => {
    if (typeof result === "string" && !result) {
      router.replace("/analyze");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfcfb]">
        <div className="text-center">
          <p className="text-sm text-gray-500">{t("noLeaseAnalyzedYet")}</p>
          <Link href="/analyze" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline">
            {t("goToUpload")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfcfb] text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SignSafeLogo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/analyze" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {t("backToUpload")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <AnalysisResultsView backLink={{ href: "/analyze", label: t("backToUpload").replace("← ", "") }} />
      </main>
    </div>
  );
}
