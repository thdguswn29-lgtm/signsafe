"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAnalysis } from "../context/analysis-context";
import { useLanguage } from "../context/language-context";
import { RiskScoreRing } from "./RiskScoreRing";
import { AnimatedNumber, MotionButton, MotionCard, MotionReveal } from "./motion";
import {
  parseKeyTerms,
  extractMarketComparisonValues,
  parseDollarToNumber,
  MARKET_STANDARDS,
} from "../lib/lease-utils";

type BackLink = { href: string; label: string };

type ScannableText = {
  takeaway: string;
  bullets: string[];
};

const CLAMP_3_LINES = "[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden";

function splitIntoReadablePoints(text: string): ScannableText {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return { takeaway: "", bullets: [] };

  const sentenceParts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parts = sentenceParts.length > 1
    ? sentenceParts
    : normalized.split(/;\s+|,\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean);

  const takeaway = parts[0] ?? normalized;
  const bullets = parts.slice(1, 4);
  return { takeaway, bullets };
}

function ScannableExplanation({
  text,
  takeawayLabel,
  detailsLabel,
}: {
  text: string;
  takeawayLabel: string;
  detailsLabel: string;
}) {
  const { takeaway, bullets } = splitIntoReadablePoints(text);

  if (!takeaway) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{takeawayLabel}</p>
      <p className={`text-sm font-medium leading-relaxed text-gray-900 ${CLAMP_3_LINES}`}>{takeaway}</p>
      {bullets.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{detailsLabel}</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {bullets.map((point, index) => (
              <li key={`${point}-${index}`} className={`pl-4 leading-relaxed ${CLAMP_3_LINES}`}>
                • {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AnalysisResultsView({ backLink }: { backLink?: BackLink }) {
  const { t } = useLanguage();
  const {
    leaseText,
    result,
    leaseVerdict,
    riskScore,
    riskWarning,
    legalRisks,
    highlightedClauses,
    summary,
    aiRiskScore,
    aiRiskReasons,
    negotiationDraft,
    recentAnalyses,
    askAnswer,
    askLoading,
    askError,
    analysisExpanded,
    setAnalysisExpanded,
    leaseSummaryExpanded,
    setLeaseSummaryExpanded,
    detailedAnalysisExpanded,
    setDetailedAnalysisExpanded,
    handleGenerateNegotiationMessage,
    handleAskQuestion,
  } = useAnalysis();

  const keyTerms = useMemo(() => parseKeyTerms(leaseText), [leaseText]);
  const marketComparison = useMemo(() => {
    const extracted = extractMarketComparisonValues(leaseText);
    const rentNum = parseDollarToNumber(keyTerms.monthlyRent);
    const depositNum = parseDollarToNumber(keyTerms.securityDeposit);
    const depositMonths = rentNum && depositNum && rentNum > 0 ? depositNum / rentNum : null;
    const rows: Array<{ label: string; typical: string; leaseValue: string; badge: string; badgeClass: string }> = [];
    rows.push({
      label: t("benchmarkSecurityDeposit"),
      typical: t("typicalOneMonthRent"),
      leaseValue: depositMonths != null ? `${depositMonths.toFixed(1)} ${t("monthsRent")}` : (keyTerms.securityDeposit !== "—" ? keyTerms.securityDeposit : t("notDetected")),
      badge: depositMonths == null ? t("needsReview") : depositMonths > MARKET_STANDARDS.securityDepositMonths ? t("aboveBenchmark") : t("withinBenchmark"),
      badgeClass: depositMonths == null ? "bg-amber-100 text-amber-700" : depositMonths > MARKET_STANDARDS.securityDepositMonths ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
    });
    rows.push({
      label: t("benchmarkLateFee"),
      typical: t("typicalLateFeeUpTo"),
      leaseValue: extracted.lateFee != null ? `$${extracted.lateFee}` : t("notDetected"),
      badge: extracted.lateFee == null ? t("needsReview") : extracted.lateFee > MARKET_STANDARDS.lateFeeTypicalMax ? t("aboveBenchmark") : t("withinBenchmark"),
      badgeClass: extracted.lateFee == null ? "bg-amber-100 text-amber-700" : extracted.lateFee > MARKET_STANDARDS.lateFeeTypicalMax ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
    });
    rows.push({
      label: t("benchmarkEntryNotice"),
      typical: t("typicalEntryNotice"),
      leaseValue: extracted.entryNoticeHours != null ? `${extracted.entryNoticeHours} ${t("hoursUnit")}` : t("notDetected"),
      badge: extracted.entryNoticeHours == null ? t("needsReview") : extracted.entryNoticeHours < MARKET_STANDARDS.entryNoticeHours ? t("aboveBenchmark") : t("withinBenchmark"),
      badgeClass: extracted.entryNoticeHours == null ? "bg-amber-100 text-amber-700" : extracted.entryNoticeHours < MARKET_STANDARDS.entryNoticeHours ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
    });
    rows.push({
      label: t("benchmarkRenewalNotice"),
      typical: t("typicalRenewalNotice"),
      leaseValue: extracted.renewalNoticeDays != null ? `${extracted.renewalNoticeDays} ${t("daysUnit")}` : t("notDetected"),
      badge: extracted.renewalNoticeDays == null ? t("needsReview") : extracted.renewalNoticeDays > MARKET_STANDARDS.renewalNoticeDays ? t("aboveBenchmark") : t("withinBenchmark"),
      badgeClass: extracted.renewalNoticeDays == null ? "bg-amber-100 text-amber-700" : extracted.renewalNoticeDays > MARKET_STANDARDS.renewalNoticeDays ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
    });
    return rows;
  }, [leaseText, keyTerms.monthlyRent, keyTerms.securityDeposit, t]);

  const safetyScore = riskScore !== null ? Math.max(0, 100 - riskScore) : null;
  const riskLevel =
    riskScore === null ? null
      : riskScore >= 55 ? "High Risk"
      : riskScore >= 30 ? "Moderate Risk"
      : "Low Risk";

  const verdict =
    leaseVerdict ||
    (result ? result.split(".")[0].trim() + "." : "") ||
    t("runAnalysisForVerdict");

  const translatedRiskLevel =
    riskLevel === "High Risk" ? t("highRisk")
      : riskLevel === "Moderate Risk" ? t("moderateRisk")
      : riskLevel === "Low Risk" ? t("lowRisk")
      : riskLevel;

  const riskBadgeClass = (level: string | null) =>
    level === "High Risk" ? "bg-red-100 text-red-700"
      : level === "Moderate Risk" ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  const verdictStatus =
    riskLevel === "High Risk"
      ? "HIGH RISK"
      : riskLevel === "Moderate Risk"
        ? "CAUTION"
        : "SAFE";

  const verdictStatusClass =
    verdictStatus === "HIGH RISK"
      ? "bg-red-100 text-red-700"
      : verdictStatus === "CAUTION"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  const topRiskClauses = useMemo(() => {
    const candidates = [
      ...(riskWarning ? [riskWarning] : []),
      ...highlightedClauses,
      ...aiRiskReasons,
      ...(summary?.risks ?? []),
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    const unique = Array.from(new Set(candidates));
    return unique.slice(0, 3);
  }, [riskWarning, highlightedClauses, aiRiskReasons, summary?.risks]);

  const remainingHighlightedClauses = useMemo(
    () => highlightedClauses.filter((clause) => !topRiskClauses.includes(clause)),
    [highlightedClauses, topRiskClauses],
  );

  const getLegalRiskLabel = (index: number) => {
    if (index === 0) return t("highRisk");
    if (index <= 2) return t("moderateRisk");
    return t("standard");
  };

  const agentKeyRecommendation = useMemo(() => {
    if (topRiskClauses.length === 0) return t("agentRecommendationDefault");
    if (riskLevel === "High Risk") {
      return `${t("agentRecommendationHigh")} ${topRiskClauses[0]}`;
    }
    if (riskLevel === "Moderate Risk") {
      return `${t("agentRecommendationModerate")} ${topRiskClauses[0]}`;
    }
    return t("agentRecommendationLow");
  }, [topRiskClauses, riskLevel, t]);

  const hasNegotiationDraft = negotiationDraft.trim().length > 0;
  const hasAskedAgent = askAnswer.trim().length > 0;

  const actionPlan = [
    { key: "agentPlanStep1", done: topRiskClauses.length > 0 },
    { key: "agentPlanStep2", done: hasNegotiationDraft },
    { key: "agentPlanStep3", done: hasAskedAgent },
  ];

  const scenarioSummary = useMemo(() => {
    const primaryRisk = topRiskClauses[0] ?? t("scenarioPrimaryRiskFallback");
    if (riskLevel === "High Risk") {
      return {
        asIsBadge: t("highRisk"),
        asIsText: `${t("scenarioAsIsHigh")} ${primaryRisk}`,
        negotiateBadge: t("moderateRisk"),
        negotiateText: t("scenarioNegotiateHigh"),
      };
    }
    if (riskLevel === "Moderate Risk") {
      return {
        asIsBadge: t("moderateRisk"),
        asIsText: `${t("scenarioAsIsModerate")} ${primaryRisk}`,
        negotiateBadge: t("lowRisk"),
        negotiateText: t("scenarioNegotiateModerate"),
      };
    }
    return {
      asIsBadge: t("lowRisk"),
      asIsText: t("scenarioAsIsLow"),
      negotiateBadge: t("lowRisk"),
      negotiateText: t("scenarioNegotiateLow"),
    };
  }, [riskLevel, topRiskClauses, t]);

  return (
    <div className="space-y-10">
      {backLink && (
        <MotionReveal>
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← {backLink.label}
          </Link>
        </MotionReveal>
      )}

      {/* 1) Lease Verdict */}
      <MotionCard className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("leaseVerdict")}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${verdictStatusClass}`}>
            {riskScore !== null ? verdictStatus : t("runAnalysisToSee")}
          </span>
        </div>
        <div className="mt-3">
          <ScannableExplanation
            text={verdict}
            takeawayLabel={t("keyTakeaway")}
            detailsLabel={t("supportingDetails")}
          />
        </div>
        {riskScore !== null && (
          <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("safetyScore")}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                <AnimatedNumber value={riskScore} />/100
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("riskAnalysis")}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{translatedRiskLevel}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("topRisks")}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{topRiskClauses.length || 0}</p>
            </div>
          </div>
        )}
      </MotionCard>

      {/* 2) Top 3 Risky Clauses */}
      <MotionCard delay={0.1} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("agentKeyRecommendationTitle")}</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{agentKeyRecommendation}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("topRisks")}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClass(riskLevel)}`}>
            {translatedRiskLevel ?? t("runAnalysisToSee")}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{t("highRiskClause")}</p>
        <div className="mt-4 space-y-3">
          {topRiskClauses.length > 0 ? (
            topRiskClauses.map((clause, index) => (
              <div
                key={`${clause}-${index}`}
                className="rounded-xl border border-red-200 bg-red-50/60 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  {index + 1}. {t("highRiskClause")}
                </p>
                <div className="mt-2">
                  <ScannableExplanation
                    text={clause}
                    takeawayLabel={t("keyTakeaway")}
                    detailsLabel={t("supportingDetails")}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              {t("runAnalysisToSee")} {t("topRisks").toLowerCase()}.
            </div>
          )}
        </div>
      </MotionCard>

      {/* 3) Recommended Action */}
      <MotionCard delay={0.2} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-l-4 border-emerald-500 pl-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("recommendedActionCardTitle")}</h2>
          <p className="mt-1 text-sm text-gray-600">{t("recommendedActionCardDesc")}</p>
        </div>
        {topRiskClauses.length > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("keyRisksDetected")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {topRiskClauses.slice(0, 2).map((risk, index) => (
                <li key={`${risk}-${index}`} className={CLAMP_3_LINES}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>{t("recommendedAction1")}</li>
          <li>{t("recommendedAction2")}</li>
          <li>{t("recommendedAction3")}</li>
        </ul>
        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("nextBestStep")}</p>
          <p className="mt-1 text-sm text-gray-700">{t("generateNegotiationHint")}</p>
        </div>

        <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("agentActionPlanTitle")}</p>
          <ul className="mt-3 space-y-2">
            {actionPlan.map((step) => (
              <li key={step.key} className="flex items-center gap-2 text-sm text-gray-700">
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {step.done ? "✓" : "•"}
                </span>
                <span>{t(step.key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </MotionCard>

      {/* 4) Negotiation Message */}
      <MotionCard delay={0.3} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("negotiationDraft")}</h2>
        <p className="mt-1 text-sm text-gray-600">{t("generateNegotiationHint")}</p>
        <MotionButton
          type="button"
          onClick={handleGenerateNegotiationMessage}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t("generateNegotiationMessage")}
        </MotionButton>
        {negotiationDraft ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <ScannableExplanation
              text={negotiationDraft}
              takeawayLabel={t("keyTakeaway")}
              detailsLabel={t("supportingDetails")}
            />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            {t("generateNegotiationMessageHintEmpty")}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("scenarioSimulationTitle")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-100 bg-red-50/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("scenarioAsIsTitle")}</p>
              <span className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{scenarioSummary.asIsBadge}</span>
              <p className="mt-2 text-sm text-gray-700">{scenarioSummary.asIsText}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("scenarioNegotiateTitle")}</p>
              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${riskLevel === "High Risk" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{scenarioSummary.negotiateBadge}</span>
              <p className="mt-2 text-sm text-gray-700">{scenarioSummary.negotiateText}</p>
            </div>
          </div>
        </div>
      </MotionCard>

      {/* 5) Market Benchmark */}
      <MotionCard delay={0.4} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("typicalLeaseBenchmark")}</h2>
        <p className="mt-1 text-sm text-gray-600">{t("benchmarkDesc")}</p>
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("californiaLensTitle")}</p>
          <p className="mt-1 text-sm text-gray-700">{t("californiaLensBody")}</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {marketComparison.map((row, index) => (
            <MotionReveal key={index} delay={0.1 * index}>
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-sm font-semibold text-gray-900">{row.label}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("typical")}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{row.typical}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("thisLease")}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{row.leaseValue}</p>
                </div>
              </div>
              <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${row.badgeClass}`}>
                {row.badge}
              </span>
              </div>
            </MotionReveal>
          ))}
        </div>
      </MotionCard>

      {/* 6) Detailed Analysis + Secondary Tools */}
      <MotionCard delay={0.5} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setDetailedAnalysisExpanded((e) => !e)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("detailedAnalysis")}</h2>
          <span className="text-gray-400">{detailedAnalysisExpanded ? "▼" : "▶"}</span>
        </button>
        {detailedAnalysisExpanded && (
          <div className="space-y-8 border-t border-gray-100 px-6 pb-6 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">{t("analysisResult")}</p>
              <button type="button" onClick={() => setAnalysisExpanded((e) => !e)} className="text-sm font-medium text-emerald-600 hover:underline">
                {analysisExpanded ? t("showLess") : t("showMore")}
              </button>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <ScannableExplanation
                text={analysisExpanded ? result : result.slice(0, 420)}
                takeawayLabel={t("keyTakeaway")}
                detailsLabel={t("supportingDetails")}
              />
            </div>

            {aiRiskScore !== null && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("aiRiskAssessment")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                    <RiskScoreRing score={aiRiskScore} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900"><AnimatedNumber value={aiRiskScore} /></span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${aiRiskScore >= 55 ? "bg-red-100 text-red-700" : aiRiskScore >= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {aiRiskScore >= 55 ? t("highRisk") : aiRiskScore >= 30 ? t("moderateRisk") : t("standard")}
                  </span>
                </div>
                {aiRiskReasons.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {aiRiskReasons.map((reason, index) => (
                      <li key={index} className="rounded-lg bg-gray-50 px-3 py-2">
                        <ScannableExplanation
                          text={reason}
                          takeawayLabel={t("keyTakeaway")}
                          detailsLabel={t("supportingDetails")}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {remainingHighlightedClauses.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("highlightedRiskClauses")}</p>
                <ul className="mt-3 space-y-2">
                  {remainingHighlightedClauses.map((clause, index) => (
                    <li key={index} className="rounded-lg border-l-2 border-red-300 bg-red-50/40 py-2 pl-3 pr-2">
                      <ScannableExplanation
                        text={clause}
                        takeawayLabel={t("keyTakeaway")}
                        detailsLabel={t("supportingDetails")}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {legalRisks.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("legalRiskCategories")}</p>
                <div className="mt-3 space-y-2">
                  {legalRisks.slice(0, 5).map((item, index) => {
                    const label = getLegalRiskLabel(index);
                    const badgeClass =
                      label === t("highRisk")
                        ? "bg-red-100 text-red-700"
                        : label === t("moderateRisk")
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700";
                    return (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-500">{t("californiaRiskNote")}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("leaseDetails")}</h3>
              {summary && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setLeaseSummaryExpanded((e) => !e)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-xs font-semibold text-gray-500">{t("leaseSummary")}</span>
                    <span className="text-sm font-medium text-emerald-600">{leaseSummaryExpanded ? t("showLess") : t("showMore")}</span>
                  </button>
                  {leaseSummaryExpanded && (
                    <>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("rent")}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">{summary.monthlyRent || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("deposit")}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">{summary.securityDeposit || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("term")}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">{summary.leaseTerm || "—"}</p>
                        </div>
                      </div>
                      {summary.risks?.length > 0 && (
                        <div className="mt-4 rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("topRisks")}</p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            {summary.risks.map((risk, index) => (
                              <li key={index}>• {risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className={`mt-4 ${summary ? "border-t border-gray-100 pt-4" : ""}`}>
                <p className="text-xs font-semibold text-gray-500">{t("keyTerms")}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">{t("rent")}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{keyTerms.monthlyRent}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">{t("deposit")}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{keyTerms.securityDeposit}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">{t("term")}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{keyTerms.leaseTerm}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("askSignSafe")}</h3>
              <p className="mt-1 text-sm text-gray-600">{t("askSignSafeDesc")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { q: "What is the most risky clause?", key: "askRiskyClause", highlight: false },
                  { q: "Is this normal in California?", key: "askCalifornia", highlight: true },
                  { q: "Should I negotiate this?", key: "askNegotiate", highlight: false },
                  { q: "What should I say to the landlord?", key: "askSayToLandlord", highlight: false },
                  { q: "What does this clause mean?", key: "askClauseMean", highlight: false },
                  { q: "How can I ask the landlord to change it?", key: "askLandlordChange", highlight: false },
                ].map((item, i) => (
                  <MotionButton
                    key={i}
                    type="button"
                    onClick={() => handleAskQuestion(item.q)}
                    disabled={askLoading}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${item.highlight ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {t(item.key)}
                  </MotionButton>
                ))}
              </div>
              {askLoading && <p className="mt-3 text-sm text-gray-500">{t("gettingAnswer")}</p>}
              {askError && <p className="mt-3 text-sm font-medium text-red-600">{askError}</p>}
              {askAnswer && !askLoading && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">{t("answer")}</p>
                  <div className="mt-2">
                    <ScannableExplanation
                      text={askAnswer}
                      takeawayLabel={t("keyTakeaway")}
                      detailsLabel={t("supportingDetails")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </MotionCard>

      {/* Recent Analyses moved to bottom */}
      <MotionCard delay={0.6} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("recentAnalyses")}</h2>
        <ul className="mt-3 space-y-2">
          {recentAnalyses.length > 0
            ? recentAnalyses.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span className="truncate">{item}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${i === 0 ? riskBadgeClass(riskLevel) : "bg-gray-200 text-gray-600"}`}>
                    {i === 0 ? translatedRiskLevel ?? "—" : "—"}
                  </span>
                </li>
              ))
            : (
              <>
                <li className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span>Lease_Agreement.pdf</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{t("highRisk")}</span>
                </li>
                <li className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span>Lease_Renewal.pdf</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{t("lowRisk")}</span>
                </li>
              </>
            )}
        </ul>
      </MotionCard>

      <p className="text-center text-xs text-gray-400">{t("disclaimer")}</p>
    </div>
  );
}
