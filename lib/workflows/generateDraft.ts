import { createClaudeClient, MODEL_FAST } from "@/lib/ai/claude";
import { createServerClient } from "@/lib/db/client";
import type { ResearchBrief, NewsletterDraft } from "@/lib/types";

export interface DraftJobPayload {
  issueId: string;
  brief: ResearchBrief;
  newsletterType: string;
  audience: string;
  tone: string;
  length: string;
}

export interface DraftJobResult {
  draft: NewsletterDraft;
  title: string;
  subtitle: string;
}

// Parse "Medium · 800–1,000 words" → "800–1,000 words" for body guidance
function parseWordTarget(lengthStr: string): string {
  if (lengthStr.includes("2,000") || lengthStr.includes("2000")) return "2,000–2,500 words";
  if (lengthStr.includes("1,500") || lengthStr.includes("1500")) return "1,500–1,800 words";
  if (lengthStr.includes("800") || lengthStr.includes("1,000")) return "800–1,000 words";
  if (lengthStr.includes("300") || lengthStr.includes("500")) return "300–500 words";
  if (lengthStr.includes("400") || lengthStr.includes("600")) return "400–600 words";
  return "700–900 words";
}

function buildDraftPrompt(payload: DraftJobPayload): { system: string; user: string } {
  const { brief } = payload;
  const wordTarget = parseWordTarget(payload.length);

  const system = `You are a senior newsletter editor at a tier-1 B2B media company. Write editorial-quality newsletters grounded in the research brief. Return valid JSON only — no markdown fences, no preamble.`;

  const sourceList = brief.sources.map((s) => `[${s.domain}] ${s.title}`).join("\n");

  const user = `Write a complete newsletter draft from this research brief.

**Main Thesis:** ${brief.mainThesis}
**Key Findings:** ${brief.keyFindings.join(" | ")}
**Suggested Angle:** ${brief.suggestedAngle}
**Type:** ${payload.newsletterType} | **Audience:** ${payload.audience} | **Tone:** ${payload.tone}

**Sources (cite domain inline):**
${sourceList}

LENGTH REQUIREMENT: The body must be ${wordTarget}. Do not truncate — write the full length.

Return JSON with these exact keys:
{
  "title": "<newsletter title>",
  "subtitle": "<subtitle / deck line>",
  "hook": "<opening hook — 2–3 punchy sentences, the first thing readers see>",
  "body": "<main body — MUST be ${wordTarget}, structured paragraphs, cite at least 2 sources inline by domain, use subheadings if helpful>",
  "takeaways": "<3–5 bullet takeaways, each starting with a verb>",
  "cta": "<closing call to action — 2–3 sentences>",
  "subjectLines": ["<email subject option 1>", "<option 2>", "<option 3>", "<option 4>", "<option 5>"],
  "previewText": ["<email preview snippet 1, 1 sentence>", "<option 2>", "<option 3>", "<option 4>", "<option 5>"]
}`;

  return { system, user };
}

export async function processDraftJob(payload: DraftJobPayload): Promise<DraftJobResult> {
  const client = createClaudeClient();
  const db = createServerClient();

  const { system, user } = buildDraftPrompt(payload);

  const response = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 3000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no text block");

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude draft response");

  const raw = JSON.parse(jsonMatch[0]) as {
    title: string;
    subtitle: string;
    hook: string;
    body: string;
    takeaways: string;
    cta: string;
    subjectLines: string[];
    previewText: string[];
  };

  await db.from("newsletter_drafts").upsert({
    issue_id: payload.issueId,
    hook: raw.hook,
    body: raw.body,
    takeaways: raw.takeaways,
    cta: raw.cta,
    subject_lines: raw.subjectLines,
    preview_texts: raw.previewText,
    llm_model: MODEL_FAST,
    generated_at: new Date().toISOString(),
  });

  await db
    .from("newsletter_issues")
    .update({ title: raw.title, subtitle: raw.subtitle, updated_at: new Date().toISOString() })
    .eq("id", payload.issueId);

  const draft: NewsletterDraft = {
    issueId: payload.issueId,
    hook: raw.hook,
    body: raw.body,
    takeaways: raw.takeaways,
    cta: raw.cta,
    subjectLines: raw.subjectLines,
    previewTexts: raw.previewText,
    llmModel: MODEL_FAST,
    generatedAt: new Date().toISOString(),
  };

  return { draft, title: raw.title, subtitle: raw.subtitle };
}
