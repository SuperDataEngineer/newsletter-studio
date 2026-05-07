import type { Brief } from "../schemas";

interface DraftPromptInput {
  brief: Brief & { sources: Array<{ id: string; title: string; domain: string }> };
  type: string;
  audience: string;
  tone: string;
  length: string;
  brandVoice?: string;
}

export function buildDraftPrompt(input: DraftPromptInput): { system: string; user: string } {
  const system = `You are a senior newsletter editor at a tier-1 B2B media company. Write editorial-quality newsletters grounded in the provided research brief. Cite at least 2 sourceIds inline. Return valid JSON.`;

  const user = `Write a newsletter draft from this research brief.

**Thesis:** ${input.brief.mainThesis}
**Key findings:** ${input.brief.keyFindings.join(" | ")}
**Angle:** ${input.brief.suggestedAngle}
**Type:** ${input.type} | **Audience:** ${input.audience} | **Tone:** ${input.tone} | **Length:** ${input.length}
${input.brandVoice ? `**Brand voice:** ${input.brandVoice}` : ""}

Sources available: ${input.brief.sources.map((s) => `[${s.id}] ${s.domain}`).join(", ")}

Return JSON: title, subtitle, hook (≤500 chars), body (cite ≥2 sources inline, ≤3500 chars), takeaways (≤800 chars), cta (≤400 chars), subjectLines (5 options ≤80 chars each), previewText (5 options ≤140 chars each, parallel to subjectLines).`;

  return { system, user };
}
