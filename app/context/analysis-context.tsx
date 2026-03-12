"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { LegalRisk, LeaseSummary } from "@/app/lib/lease-utils";
import { extractRiskClauses } from "@/app/lib/lease-utils";

const DEFAULT_LEASE_TEXT = `This Lease Agreement is made between Landlord and Tenant.

Monthly Rent: $2,400
Security Deposit: $2,400
Lease Term: 12 months, beginning on August 1, 2026 and ending on July 31, 2027.
Late Fee: $75 if rent is not paid within 5 days of the due date.
Termination: If Tenant terminates early, Tenant must pay 2 months of rent as a penalty.
Renewal: This lease automatically renews for another 12 months unless written notice is given 60 days before the end date.
Landlord Entry: Landlord may enter the property with 24 hours notice for inspection or repairs.
Maintenance: Tenant is responsible for minor repairs under $100.`;

type AnalysisContextValue = {
  leaseText: string;
  setLeaseText: (v: string) => void;
  result: string;
  leaseVerdict: string;
  riskScore: number | null;
  riskWarning: string;
  legalRisks: LegalRisk[];
  highlightedClauses: string[];
  summary: LeaseSummary | null;
  aiRiskScore: number | null;
  aiRiskReasons: string[];
  loading: boolean;
  error: string;
  setError: (v: string) => void;
  isDragging: boolean;
  recentAnalyses: string[];
  negotiationDraft: string;
  setNegotiationDraft: (v: string) => void;
  uploadSuccess: boolean;
  askAnswer: string;
  askLoading: boolean;
  askError: string;
  analysisExpanded: boolean;
  setAnalysisExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  askSignSafeOpen: boolean;
  setAskSignSafeOpen: (v: boolean) => void;
  leaseSummaryExpanded: boolean;
  setLeaseSummaryExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  detailedAnalysisExpanded: boolean;
  setDetailedAnalysisExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  analysisStep: number;
  analysisSteps: string[];
  handleFileUpload: (file: File) => Promise<void>;
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
  handleAnalyze: (onSuccess?: () => void) => Promise<void>;
  handleGenerateNegotiationMessage: () => void;
  handleAskQuestion: (question: string) => Promise<void>;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [leaseText, setLeaseText] = useState(DEFAULT_LEASE_TEXT);
  const [result, setResult] = useState("");
  const [leaseVerdict, setLeaseVerdict] = useState("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskWarning, setRiskWarning] = useState("");
  const [legalRisks, setLegalRisks] = useState<LegalRisk[]>([]);
  const [highlightedClauses, setHighlightedClauses] = useState<string[]>([]);
  const [summary, setSummary] = useState<LeaseSummary | null>(null);
  const [aiRiskScore, setAiRiskScore] = useState<number | null>(null);
  const [aiRiskReasons, setAiRiskReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<string[]>([]);
  const [negotiationDraft, setNegotiationDraft] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [askAnswer, setAskAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const [askSignSafeOpen, setAskSignSafeOpen] = useState(false);
  const [leaseSummaryExpanded, setLeaseSummaryExpanded] = useState(false);
  const [detailedAnalysisExpanded, setDetailedAnalysisExpanded] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    "Extracting text from document...",
    "Scanning legal risks with LegalBERT...",
    "Analyzing contract terms with AI...",
    "Generating negotiation guidance...",
  ];

  useEffect(() => {
    if (!loading) {
      setAnalysisStep(0);
      return;
    }
    const interval = setInterval(() => {
      setAnalysisStep((s) => (s < 3 ? s + 1 : s));
    }, 750);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = useCallback(async (file: File) => {
    setError("");
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to extract text from file");
    }
    const data = await res.json();
    setLeaseText(data.text || "");
    setUploadSuccess(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleGenerateNegotiationMessage = useCallback(() => {
    const draft = `Subject: Request to clarify lease terms

Dear Landlord,

I noticed that the lease includes a clause regarding early termination penalties.
Could we clarify this clause or discuss adjusting the terms?

Thank you for your time.

Best regards
Tenant`;
    setNegotiationDraft(draft);
  }, []);

  const handleAskQuestion = useCallback(async (question: string) => {
    setAskLoading(true);
    setAskError("");
    setAskAnswer("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${leaseText}\n\n---\nQuestion: ${question}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Request failed");
      setAskAnswer(data.result || "No response returned.");
    } catch (err: unknown) {
      setAskError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setAskLoading(false);
    }
  }, [leaseText]);

  const handleAnalyze = useCallback(
    async (onSuccess?: () => void) => {
      if (!leaseText.trim()) {
        setError("Please paste your lease contract text first.");
        return;
      }
      setLoading(true);
      setError("");
      setResult("");
      setLeaseVerdict("");
      setRiskScore(null);
      setRiskWarning("");
      setNegotiationDraft("");
      setLegalRisks([]);
      setHighlightedClauses([]);
      setSummary(null);
      setAiRiskScore(null);
      setAiRiskReasons([]);
      setUploadSuccess(false);
      setAskAnswer("");
      setAskError("");
      setAnalysisExpanded(false);
      setAskSignSafeOpen(false);
      setLeaseSummaryExpanded(false);
      setDetailedAnalysisExpanded(false);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: leaseText }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Analysis failed");
        }
        setResult(data.result || "No result returned");
        setLeaseVerdict(data.leaseVerdict ?? "");
        setSummary(data.summary || null);
        setAiRiskScore(
          typeof data.aiRiskScore === "number" ? data.aiRiskScore : null
        );
        setAiRiskReasons(
          Array.isArray(data.aiRiskReasons) ? data.aiRiskReasons : []
        );
        setHighlightedClauses(
          Array.isArray(data.highlightedClauses) &&
            data.highlightedClauses.length > 0
            ? data.highlightedClauses
            : extractRiskClauses(leaseText)
        );
        setLegalRisks(Array.isArray(data.legalRisks) ? data.legalRisks : []);

        const text = leaseText.toLowerCase();
        let score = 0;
        let warning = "";
        if (text.includes("termination") || text.includes("penalty")) {
          score += 30;
          warning =
            "Early termination penalty detected. Tenant may owe extra rent.";
        }
        if (text.includes("late fee")) score += 10;
        if (text.includes("automatic") || text.includes("renew")) score += 15;
        setRiskScore(score);
        setRiskWarning(warning);

        setRecentAnalyses((prev) => [
          `Lease ${new Date().toLocaleTimeString()}`,
          ...prev.slice(0, 4),
        ]);
        onSuccess?.();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
    [leaseText]
  );

  const value: AnalysisContextValue = {
    leaseText,
    setLeaseText,
    result,
    leaseVerdict,
    riskScore,
    riskWarning,
    legalRisks,
    highlightedClauses,
    summary,
    aiRiskScore,
    aiRiskReasons,
    loading,
    error,
    setError,
    isDragging,
    recentAnalyses,
    negotiationDraft,
    setNegotiationDraft,
    uploadSuccess,
    askAnswer,
    askLoading,
    askError,
    analysisExpanded,
    setAnalysisExpanded,
    askSignSafeOpen,
    setAskSignSafeOpen,
    leaseSummaryExpanded,
    setLeaseSummaryExpanded,
    detailedAnalysisExpanded,
    setDetailedAnalysisExpanded,
    analysisStep,
    analysisSteps,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAnalyze,
    handleGenerateNegotiationMessage,
    handleAskQuestion,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("useAnalysis must be used within AnalysisProvider");
  }
  return ctx;
}
