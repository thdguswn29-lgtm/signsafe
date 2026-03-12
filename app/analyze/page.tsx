"use client";

import Link from "next/link";
import { useAnalysis } from "../context/analysis-context";
import { useLanguage } from "../context/language-context";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import SignSafeLogo from "../components/SignSafeLogo";
import { AnalysisResultsView } from "../components/AnalysisResultsView";
import { MotionButton, MotionCard, MotionReveal } from "../components/motion";

const ANALYSIS_STEP_KEYS = ["analysisStep1", "analysisStep2", "analysisStep3", "analysisStep4"] as const;

export default function AnalyzePage() {
  const { t } = useLanguage();
  const {
    leaseText,
    setLeaseText,
    loading,
    error,
    isDragging,
    uploadSuccess,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAnalyze,
    analysisStep,
    result,
  } = useAnalysis();

  const onAnalyze = async () => {
    await handleAnalyze();
  };

  return (
    <div className="min-h-screen bg-[#fbfcfb] text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SignSafeLogo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {!result ? (
          <>
            <MotionCard className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t("analyzeYourLease")}</h1>
                  <p className="text-sm text-gray-500">{t("analyzeYourLeaseDesc")}</p>
                </div>
              </div>

              <section
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-6 rounded-xl border-2 border-dashed p-8 text-center transition ${
                  isDragging ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20" : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="mt-4 font-semibold text-gray-900">{t("dropLeaseHere")}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {t("or")}{" "}
                  <label htmlFor="lease-file" className="cursor-pointer font-medium text-emerald-600 hover:underline">
                    {t("clickToBrowse")}
                  </label>
                </p>
                <p className="mt-1 text-xs text-gray-400">{t("supportsPdf")}</p>
                {uploadSuccess && (
                  <p className="mt-3 text-sm font-medium text-emerald-600">{t("fileUploadedSuccess")}</p>
                )}
                <input
                  id="lease-file"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                />
              </section>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-sm font-medium text-gray-500">{t("orPasteText")}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="mt-6">
                <label htmlFor="lease-input" className="block text-sm font-semibold text-gray-700">
                  {t("leaseTextLabel")}
                </label>
                <textarea
                  id="lease-input"
                  value={leaseText}
                  onChange={(e) => setLeaseText(e.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder={t("leaseTextPlaceholder")}
                />
                {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

                {loading ? (
                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-sm font-semibold text-gray-700">{t("analyzingLease")}</h3>
                    <div className="mt-4 grid gap-2">
                      <div className="h-2 w-full animate-pulse rounded bg-gray-200" />
                      <div className="h-2 w-5/6 animate-pulse rounded bg-gray-200 [animation-delay:120ms]" />
                      <div className="h-2 w-4/6 animate-pulse rounded bg-gray-200 [animation-delay:220ms]" />
                    </div>
                    <ul className="mt-4 space-y-3">
                      {ANALYSIS_STEP_KEYS.map((key, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-3 text-sm ${i === analysisStep ? "text-emerald-600 font-medium" : "text-gray-400"}`}
                        >
                          {i <= analysisStep ? (
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ${i === analysisStep ? "animate-pulse" : ""}`} />
                          ) : (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-200" />
                          )}
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <MotionButton
                    onClick={onAnalyze}
                    disabled={loading}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("analyzeLease")}
                  </MotionButton>
                )}
              </div>

              <MotionReveal delay={0.08} className="mt-6 flex gap-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t("privacyTitle")}</h3>
                  <p className="mt-0.5 text-sm text-gray-600">{t("privacyDesc")}</p>
                </div>
              </MotionReveal>
            </MotionCard>
          </>
        ) : (
          <AnalysisResultsView backLink={{ href: "/", label: t("backToHome") }} />
        )}
      </main>
    </div>
  );
}
