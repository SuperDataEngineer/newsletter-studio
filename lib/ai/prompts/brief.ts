interface BriefSearchPromptInput {
  topic: string;
  type: string;
  audience: string;
  tone: string;
  length: string;
  companies: string[];
  keywords: string[];
  sourcesEnabled: string[];
}

// ── Haiku structuring prompt (Step 2: structure Perplexity output into JSON) ──

export function buildBriefStructurePrompt(
  researchContent: string,
  citations: string[]
): { system: string; user: string } {
  const system = `You are an editorial analyst. Convert raw research content into a structured newsletter brief. Return valid JSON only — no markdown fences, no preamble.`;

  const citationList = citations
    .map((url, i) => {
      try {
        const domain = new URL(url).hostname.replace("www.", "");
        return `[${i + 1}] ${url} (${domain})`;
      } catch {
        return `[${i + 1}] ${url}`;
      }
    })
    .join("\n");

  const user = `Structure the following research into a newsletter brief.

Research content:
${researchContent}

Citations:
${citationList || "No citations provided"}

Return ONLY valid JSON matching this exact schema:
{
  "mainThesis": "<core insight ≤400 chars>",
  "keyFindings": ["<finding ≤25 words>", "...", "..."],
  "suggestedAngle": "<recommended editorial angle ≤500 chars>",
  "contradictions": ["<conflicting viewpoint if found>"],
  "sources": [
    {
      "title": "<descriptive title for this source>",
      "url": "<URL from citations>",
      "domain": "<domain.com>",
      "publisher": "<publisher or organisation name>",
      "relevance": <0.0–1.0>,
      "excerpt": "<key insight from this source ≤200 chars>"
    }
  ]
}

Include all provided citations as sources. keyFindings must have 3–5 items.`;

  return { system, user };
}

// ── Legacy: Claude web_search prompt (kept for reference) ────────────────────

const SOURCE_GUIDANCE: Record<string, string> = {
  web: "general web articles and analysis",
  news: "news articles and press coverage",
  pdfs: "research reports, whitepapers, and academic papers",
  blogs: "company blogs and thought leadership posts",
};

function buildSourceGuidance(enabled: string[]): string {
  if (!enabled.length) return "";
  const labels = enabled.map((s) => SOURCE_GUIDANCE[s]).filter(Boolean);
  return labels.length ? `Source type preference: prioritise ${labels.join(", ")}.` : "";
}

// Prompt for Claude web_search — Claude researches and synthesizes in one call.
// Sources are returned inside the JSON response (no pre-fetched rawSources needed).
export function buildBriefSearchPrompt(input: BriefSearchPromptInput): string {
  return `You are an editorial research analyst at a Tier-1 strategy firm. Research the following newsletter topic using web search, then synthesize your findings into a structured brief.

**Topic:** ${input.topic}
**Newsletter Type:** ${input.type}
**Target Audience:** ${input.audience}
**Tone:** ${input.tone}
**Length target:** ${input.length}${input.companies.length ? `\n**Companies to track:** ${input.companies.join(", ")}` : ""}${input.keywords.length ? `\n**Keywords:** ${input.keywords.join(", ")}` : ""}

Perform 3–5 targeted searches. Prioritise recent content (last 12 months), tier-1 publications, primary research, and expert commentary. Never invent sources or facts.
${buildSourceGuidance(input.sourcesEnabled)}

After researching, return ONLY valid JSON (no markdown fences, no preamble) matching this exact schema:

{
  "mainThesis": "<core insight ≤400 chars>",
  "keyFindings": ["<finding ≤25 words>", "...", "..."],
  "suggestedAngle": "<recommended editorial angle ≤500 chars>",
  "contradictions": ["<conflicting viewpoint if found>"],
  "sources": [
    {
      "title": "<article title>",
      "url": "<full URL>",
      "domain": "<domain.com>",
      "publisher": "<publisher name>",
      "relevance": <0.0–1.0>,
      "excerpt": "<key quote or finding ≤200 chars>"
    }
  ]
}

Include 4–8 sources ordered by relevance descending. keyFindings must have 3–5 items.`;
}
