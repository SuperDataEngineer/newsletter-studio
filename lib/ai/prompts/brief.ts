interface BriefPromptInput {
  topic: string;
  type: string;
  audience: string;
  tone: string;
  length: string;
  companies: string[];
  keywords: string[];
  rawSources: Array<{ id: string; title: string; domain: string; markdown: string }>;
}

export function buildBriefPrompt(input: BriefPromptInput): { system: string; user: string } {
  const system = `You are an editorial research analyst at a Tier-1 strategy firm. You synthesize web sources into investor-grade research briefs. Cite by sourceId only. Never invent facts. Return valid JSON matching the schema exactly.`;

  const user = `Produce a research brief for the following newsletter.

**Topic:** ${input.topic}
**Type:** ${input.type}
**Audience:** ${input.audience}
**Tone:** ${input.tone}
**Length target:** ${input.length}
${input.companies.length ? `**Company watch:** ${input.companies.join(", ")}` : ""}
${input.keywords.length ? `**Keywords:** ${input.keywords.join(", ")}` : ""}

**Sources (cite by id):**
${input.rawSources.map((s) => `[${s.id}] ${s.title} (${s.domain})\n${s.markdown.slice(0, 1200)}`).join("\n\n---\n\n")}

Return JSON with keys: mainThesis, keyFindings (3-5 bullets ≤25 words each), suggestedAngle, sourceRanking (id, relevance 0-1, citationWorthy bool), contradictions (optional).`;

  return { system, user };
}
