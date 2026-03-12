import OpenAI from "openai";
import type { LegalRisk } from "@/app/lib/lease-utils";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LEGALBERT_API_BASE =
  process.env.LEGALBERT_API_BASE_URL ||
  process.env.LEGALBERT_API_URL ||
  "";

async function fetchLegalBertRisks(text: string): Promise<LegalRisk[]> {
  if (!LEGALBERT_API_BASE) return [];

  try {
    const response = await fetch(`${LEGALBERT_API_BASE.replace(/\/$/, "")}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

async function fetchOcrText(file: File): Promise<string> {
  if (!LEGALBERT_API_BASE) {
    throw new Error("OCR backend is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${LEGALBERT_API_BASE.replace(/\/$/, "")}/ocr`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "OCR request failed");
  }
  return typeof data?.text === "string" ? data.text : "";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }

      const text = await fetchOcrText(file);
      return Response.json({ text });
    }

    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You analyze lease contracts. Return only valid JSON. Do not wrap the response in markdown code fences or any other text.",
        },
        {
          role: "user",
          content: `Analyze this lease contract and return valid JSON with this exact shape (no other text):

{
  "leaseVerdict": "string",
  "summary": {
    "monthlyRent": "string",
    "securityDeposit": "string",
    "leaseTerm": "string",
    "risks": ["string", "string"]
  },
  "aiRiskScore": 0,
  "aiRiskReasons": ["string", "string"],
  "recommendedActions": ["string", "string"],
  "highlightedClauses": ["string", "string"],
  "result": "string"
}

Field requirements:

- leaseVerdict: One sentence only. Your overall conclusion on whether this lease is low-risk, moderate-risk, or high-risk for the tenant. Focus on major tenant risk factors (e.g. early termination penalties, automatic renewal, unfair fees, weak notice terms). Do NOT summarize rent, deposit, or lease term. Examples: "This lease contains several tenant-unfriendly clauses, including an early termination penalty and automatic renewal provision." / "This lease appears mostly standard, but includes a higher-than-typical late fee and stricter renewal terms." / "This lease appears generally low-risk and consistent with common rental agreements."

- summary: Plain-language contract description. Include monthlyRent, securityDeposit, leaseTerm (extract values). summary.risks: list the main risks.

- aiRiskScore: Integer 0–100 (higher = more risk for tenant).

- aiRiskReasons: Short reasons for the score.

- recommendedActions: List of concrete steps the tenant could take (e.g. negotiate specific clauses, get clarifications).

- highlightedClauses: Exact risky clauses or sentences from the lease text.

- result: Full plain-language explanation of the lease and its risks (for detailed analysis). Can be multiple sentences.

Lease:
${text}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const legalRisks = await fetchLegalBertRisks(text);

    return Response.json({
      leaseVerdict: parsed.leaseVerdict ?? "",
      summary: parsed.summary ?? null,
      aiRiskScore: parsed.aiRiskScore ?? null,
      aiRiskReasons: parsed.aiRiskReasons ?? [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      highlightedClauses: parsed.highlightedClauses ?? [],
      legalRisks,
      result: parsed.result ?? "",
    });
  } catch (error: any) {
    console.error("ANALYZE_ERROR:", error);
    return Response.json(
      { error: error?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}