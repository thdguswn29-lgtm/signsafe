import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
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

    return Response.json({
      leaseVerdict: parsed.leaseVerdict ?? "",
      summary: parsed.summary ?? null,
      aiRiskScore: parsed.aiRiskScore ?? null,
      aiRiskReasons: parsed.aiRiskReasons ?? [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      highlightedClauses: parsed.highlightedClauses ?? [],
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