export type LegalRisk = {
  label: string;
  score: number;
};

export type LeaseSummary = {
  monthlyRent: string;
  securityDeposit: string;
  leaseTerm: string;
  risks: string[];
};

export const MARKET_STANDARDS = {
  securityDepositMonths: 1,
  lateFeeTypicalMax: 50,
  entryNoticeHours: 24,
  renewalNoticeDays: 30,
};

export function parseKeyTerms(text: string) {
  const monthlyRentMatch =
    text.match(/\bmonthly rent[:\s]+\$?([\d,]+)/i) ??
    text.match(/\brent[:\s]+\$?([\d,]+)/i);

  const securityDepositMatch =
    text.match(/\bsecurity deposit[:\s]+\$?([\d,]+)/i);

  const leaseTermMatch =
    text.match(/\blease term[:\s]+([^.]+?)(?=\.|$)/i) ??
    text.match(/\bterm[:\s]+(\d+\s*months?[^.]*)/i);

  return {
    monthlyRent: monthlyRentMatch ? `$${monthlyRentMatch[1]}` : "—",
    securityDeposit: securityDepositMatch ? `$${securityDepositMatch[1]}` : "—",
    leaseTerm: leaseTermMatch ? leaseTermMatch[1].trim() : "—",
  };
}

export function extractRiskClauses(text: string) {
  const clauses = text
    .split(/\n|\.(?=\s|$)/)
    .map((c) => c.trim())
    .filter(Boolean);

  const riskKeywords = [
    "termination",
    "penalty",
    "late fee",
    "automatic renew",
    "renew",
    "arbitration",
    "jurisdiction",
    "choice of law",
    "liability",
    "non-refundable",
    "without notice",
    "landlord may enter",
    "deposit",
    "fee",
    "default",
    "breach",
  ];

  return clauses.filter((clause) =>
    riskKeywords.some((keyword) => clause.toLowerCase().includes(keyword))
  );
}

export function extractMarketComparisonValues(text: string) {
  const lower = text.toLowerCase();
  const lateFeeMatch = text.match(/\blate fee[:\s]+\$?([\d,]+)/i) ?? lower.match(/\blate fee[:\s]+([\d,]+)/i);
  const entryMatch = text.match(/(?:entry|enter|notice)[^\d]*(\d+)\s*hours?/i) ?? text.match(/(\d+)\s*hours?\s*(?:notice|before entry)/i);
  const renewalMatch = text.match(/(?:renewal|renew|notice)[^\d]*(\d+)\s*days?/i) ?? text.match(/(\d+)\s*days?\s*(?:before|notice)/i);
  return {
    lateFee: lateFeeMatch ? parseInt(lateFeeMatch[1].replace(/,/g, ""), 10) : null,
    entryNoticeHours: entryMatch ? parseInt(entryMatch[1], 10) : null,
    renewalNoticeDays: renewalMatch ? parseInt(renewalMatch[1], 10) : null,
  };
}

export function parseDollarToNumber(s: string): number | null {
  if (!s || s === "—") return null;
  const num = s.replace(/[$,]/g, "");
  const n = parseFloat(num);
  return Number.isNaN(n) ? null : n;
}

export function getSuggestedNextSteps(riskLevel: string | null): string[] {
  if (riskLevel === "High Risk")
    return [
      "Discuss early termination and penalty clauses with your landlord.",
      "Clarify renewal notice period and auto-renewal terms in writing.",
      "Consider having a lawyer review high-risk sections before signing.",
    ];
  if (riskLevel === "Moderate Risk")
    return [
      "Review late fees and notice periods with your landlord.",
      "Confirm maintenance responsibilities in writing.",
    ];
  return [
    "Review key terms with your agent or landlord if anything is unclear.",
    "Keep a copy of the signed lease for your records.",
  ];
}
