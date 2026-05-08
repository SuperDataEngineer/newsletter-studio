import { createClaudeClient, MODEL_FAST } from "@/lib/ai/claude";
import { createServerClient } from "@/lib/db/client";
import { researchWithPerplexity } from "@/lib/research/perplexity";
import { buildBriefStructurePrompt } from "@/lib/ai/prompts/brief";
import type { ResearchBrief } from "@/lib/types";

export interface BriefJobPayload {
  issueId: string;
  topic: string;
  industry: string;
  newsletterType: string;
  audience: string;
  tone: string;
  length: string;
  companies: string[];
  keywords: string[];
  sourcesEnabled: string[];
}

interface RawBriefResponse {
  mainThesis: string;
  keyFindings: string[];
  suggestedAngle: string;
  contradictions?: string[];
  sources: Array<{
    title: string;
    url: string;
    domain: string;
    publisher: string;
    relevance: number;
    excerpt: string;
  }>;
}

export async function processBriefJob(payload: BriefJobPayload): Promise<ResearchBrief> {
  const client = createClaudeClient();
  const db = createServerClient();

  // Step 1: Perplexity Sonar — web research + citations
  const { content, citations } = await researchWithPerplexity(payload.topic, {
    industry: payload.industry,
    newsletterType: payload.newsletterType,
    audience: payload.audience,
    tone: payload.tone,
    companies: payload.companies,
    keywords: payload.keywords,
    sourcesEnabled: payload.sourcesEnabled,
  });

  // Step 2: Claude Haiku — structure Perplexity output into our JSON schema
  const { system, user } = buildBriefStructurePrompt(content, citations);

  const response = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text block");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const raw = JSON.parse(jsonMatch[0]) as RawBriefResponse;

  // Persist sources
  const { data: insertedSources } = await db
    .from("research_sources")
    .insert(
      raw.sources.map((s) => ({
        issue_id: payload.issueId,
        title: s.title,
        publisher: s.publisher,
        domain: s.domain,
        url: s.url,
        source_type: "web",
        credibility_score: s.relevance,
        raw_excerpt: s.excerpt,
      }))
    )
    .select("id, title, publisher, domain, url, source_type, credibility_score, raw_excerpt");

  // Persist brief (upsert so re-running overwrites)
  await db.from("research_briefs").upsert({
    issue_id: payload.issueId,
    main_thesis: raw.mainThesis,
    key_findings: raw.keyFindings,
    suggested_angle: raw.suggestedAngle,
    contradictions: raw.contradictions ?? [],
    llm_model: MODEL_FAST,
    generated_at: new Date().toISOString(),
  });

  return {
    issueId: payload.issueId,
    mainThesis: raw.mainThesis,
    keyFindings: raw.keyFindings,
    suggestedAngle: raw.suggestedAngle,
    contradictions: raw.contradictions ?? null,
    llmModel: MODEL_FAST,
    generatedAt: new Date().toISOString(),
    sources: (insertedSources ?? []).map((s) => ({
      id: s.id,
      issueId: payload.issueId,
      title: s.title,
      publisher: s.publisher,
      domain: s.domain,
      url: s.url,
      sourceType: s.source_type as ResearchBrief["sources"][number]["sourceType"],
      credibilityScore: s.credibility_score,
      publishedAt: null,
      rawExcerpt: s.raw_excerpt,
    })),
  };
}
