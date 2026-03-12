"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./context/language-context";
import { useAnalysis } from "./context/analysis-context";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import SignSafeLogo from "./components/SignSafeLogo";
import { MotionButton, MotionCard, MotionReveal } from "./components/motion";

const ANALYSIS_STEP_KEYS = ["analysisStep1", "analysisStep2", "analysisStep3", "analysisStep4"] as const;

export default function Home() {
  const router = useRouter();
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
  } = useAnalysis();

  const goToAnalyze = () => router.push("/analyze");

  const onAnalyzeFromHero = async () => {
    await handleAnalyze(() => router.push("/analyze"));
  };

  return (
    <div className="min-h-screen bg-[#fbfcfb] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SignSafeLogo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t("navFeatures")}</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t("navHowItWorks")}</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t("navTestimonials")}</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t("navPricing")}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a href="#" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:inline">{t("navLogin")}</a>
            <MotionButton
              type="button"
              onClick={goToAnalyze}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t("navGetStarted")}
            </MotionButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <MotionReveal>
            <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {t("heroProtect")}{" "}
              <span className="text-emerald-600">{t("heroBeforeSign")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-600 leading-relaxed">
              {t("heroSubtitleLong")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MotionButton
                type="button"
                onClick={goToAnalyze}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                {t("ctaAnalyzeLease")}
                <span className="text-lg">→</span>
              </MotionButton>
              <MotionButton
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <span className="text-gray-500">▷</span> {t("ctaWatchDemo")}
              </MotionButton>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t("freeToTry")}
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t("resultsIn30Sec")}
              </span>
            </div>
            </div>
          </MotionReveal>

          {/* Hero right: Upload card */}
          <MotionCard delay={0.08} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t("analyzeYourLease")}</h2>
            </div>

            <section
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-4 rounded-xl border-2 border-dashed p-5 text-center transition ${
                isDragging ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20" : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="mt-3 font-semibold text-gray-900 text-sm">{t("dropLeaseHere")}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("or")}{" "}
                <label htmlFor="hero-lease-file" className="cursor-pointer font-medium text-emerald-600 hover:underline">{t("clickToBrowse")}</label>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{t("supportsPdf")}</p>
              {uploadSuccess && <p className="mt-2 text-xs font-medium text-emerald-600">{t("fileUploadedSuccess")}</p>}
              <input
                id="hero-lease-file"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
              />
            </section>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs font-medium text-gray-500">{t("orPasteText")}</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <div className="mt-4">
              <label htmlFor="hero-lease-input" className="sr-only">{t("leaseTextLabel")}</label>
              <textarea
                id="hero-lease-input"
                value={leaseText}
                onChange={(e) => setLeaseText(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder={t("leaseTextPlaceholder")}
              />
              {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}

              {loading ? (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700">{t("analyzingLease")}</p>
                  <div className="mt-3 grid gap-1.5">
                    <div className="h-1.5 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-1.5 w-5/6 animate-pulse rounded bg-gray-200 [animation-delay:120ms]" />
                    <div className="h-1.5 w-3/4 animate-pulse rounded bg-gray-200 [animation-delay:220ms]" />
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {ANALYSIS_STEP_KEYS.map((key, i) => (
                      <li key={i} className={`flex items-center gap-2 text-xs ${i === analysisStep ? "text-emerald-600 font-medium" : "text-gray-400"}`}>
                        {i <= analysisStep ? <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${i === analysisStep ? "animate-pulse" : ""}`} /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />}
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <MotionButton
                  type="button"
                  onClick={onAnalyzeFromHero}
                  disabled={loading}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("analyzeLease")}
                </MotionButton>
              )}
            </div>
          </MotionCard>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-100 bg-white py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <MotionReveal>
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("featuresLabel")}</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-gray-900 md:text-4xl">{t("featuresHeadline")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">{t("featuresSubhead")}</p>
          </MotionReveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: t("feature1Title"), desc: t("feature1Desc"), icon: "magnify" },
              { title: t("feature2Title"), desc: t("feature2Desc"), icon: "document" },
              { title: t("feature3Title"), desc: t("feature3Desc"), icon: "lightning" },
              { title: t("feature4Title"), desc: t("feature4Desc"), icon: "shield" },
              { title: t("feature5Title"), desc: t("feature5Desc"), icon: "chat" },
              { title: t("feature6Title"), desc: t("feature6Desc"), icon: "lock" },
            ].map((f, i) => (
              <MotionCard key={i} delay={0.03 * i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-emerald-500/30 text-emerald-600">
                  {f.icon === "magnify" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                  {f.icon === "document" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  {f.icon === "lightning" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  {f.icon === "shield" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                  {f.icon === "chat" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                  {f.icon === "lock" && <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-gray-100 bg-[#fbfcfb] py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <MotionReveal>
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("howItWorksLabel")}</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-gray-900 md:text-5xl">{t("howItWorksHeadline")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">{t("howItWorksSubhead")}</p>
          </MotionReveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <MotionCard className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("step01")}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{t("step1Title")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("step1Desc")}</p>
            </MotionCard>
            <MotionCard className="text-center" delay={0.06}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("step02")}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{t("step2Title")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("step2Desc")}</p>
            </MotionCard>
            <MotionCard className="text-center" delay={0.12}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("step03")}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{t("step3Title")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("step3Desc")}</p>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            <MotionReveal className="text-center">
              <p className="text-4xl font-bold text-gray-900">50,000+</p>
              <p className="mt-1 text-sm text-gray-500">{t("statLeases")}</p>
            </MotionReveal>
            <MotionReveal className="text-center" delay={0.05}>
              <p className="text-4xl font-bold text-gray-900">$2.4M</p>
              <p className="mt-1 text-sm text-gray-500">{t("statSaved")}</p>
            </MotionReveal>
            <MotionReveal className="text-center" delay={0.1}>
              <p className="text-4xl font-bold text-gray-900">4.9/5</p>
              <p className="mt-1 text-sm text-gray-500">{t("statRating")}</p>
            </MotionReveal>
            <MotionReveal className="text-center" delay={0.15}>
              <p className="text-4xl font-bold text-gray-900">30 sec</p>
              <p className="mt-1 text-sm text-gray-500">{t("statTime")}</p>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-gray-100 bg-[#fbfcfb] py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <MotionReveal>
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">{t("testimonialsLabel")}</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-gray-900 md:text-4xl">{t("testimonialsHeadline")}</h2>
          </MotionReveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { quote: t("testimonial1Quote"), author: t("testimonial1Author"), role: t("testimonial1Role") },
              { quote: t("testimonial2Quote"), author: t("testimonial2Author"), role: t("testimonial2Role") },
              { quote: t("testimonial3Quote"), author: t("testimonial3Author"), role: t("testimonial3Role") },
            ].map((item, i) => (
              <MotionCard key={i} delay={0.04 * i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-emerald-500">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <svg key={j} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="mt-4 text-base text-gray-700 italic leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 font-semibold text-gray-900">{item.author}</p>
                <p className="text-sm text-gray-500">{item.role}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="border-t border-gray-100 px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-4xl">
          <MotionReveal>
            <div className="rounded-2xl bg-gray-900 px-8 py-16 text-center shadow-xl md:px-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/50 text-emerald-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">{t("ctaHeadline")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">{t("ctaSubhead")}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MotionButton
                type="button"
                onClick={goToAnalyze}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-emerald-500"
              >
                {t("ctaButton")}
                <span>→</span>
              </MotionButton>
              <span className="text-sm text-gray-500">{t("ctaNoCard")}</span>
            </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-800">{t("appName")}</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">{t("footerDesc")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("footerProduct")}</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 hover:text-gray-900">{t("footerFeatures")}</a></li>
                <li><a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">{t("footerHowItWorks")}</a></li>
                <li><a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">{t("footerPricing")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerAPI")}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("footerCompany")}</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerAbout")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerBlog")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerCareers")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerPress")}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("footerResources")}</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerHelp")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerRights")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerGlossary")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerContact")}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("footerLegal")}</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerPrivacy")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerTerms")}</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">{t("footerSecurity")}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
            <p className="text-xs text-gray-500">{t("footerCopyright")}</p>
            <div className="flex gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-900">Twitter</a>
              <a href="#" className="hover:text-gray-900">LinkedIn</a>
              <a href="#" className="hover:text-gray-900">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
