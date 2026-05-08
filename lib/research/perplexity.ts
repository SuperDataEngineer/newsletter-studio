import OpenAI from "openai";

// Perplexity uses an OpenAI-compatible API — reuse the openai package
const SONAR_MODEL = "sonar-pro";

export interface PerplexityResult {
  content: string;
  citations: string[]; // array of source URLs
}

export async function researchWithPerplexity(
  topic: string,
  config: {
    industry: string;
    newsletterType: string;
    audience: string;
    tone: string;
    companies: string[];
    keywords: string[];
    sourcesEnabled: string[];
  }
): Promise<PerplexityResult> {
  const client = new OpenAI({
    apiKey: process.env.PPLX_API_KEY!,
    baseURL: "https://api.perplexity.ai",
  });

  const sourceGuidance = buildSourceGuidance(config.sourcesEnabled);

  const prompt = `Research the following topic for a newsletter and provide a comprehensive synthesis.

Topic: ${topic}
Industry: ${config.industry}
Newsletter Type: ${config.newsletterType}
Target Audience: ${config.audience}
${config.companies.length ? `Companies to track: ${config.companies.join(", ")}` : ""}
${config.keywords.length ? `Keywords to cover: ${config.keywords.join(", ")}` : ""}
${sourceGuidance}

Provide:
- A synthesis of the most important recent developments and findings
- Key statistics, data points, and expert perspectives
- Any contradictions or competing viewpoints in the literature
- Focus on content from the last 12 months where possible`;

  // Perplexity extends the OpenAI response with a citations field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (client.chat.completions.create({
    model: SONAR_MODEL,
    messages: [{ role: "user", content: prompt }],
  }) as any);

  const content: string = response.choices?.[0]?.message?.content ?? "";
  const citations: string[] = response.citations ?? [];

  return { content, citations };
}

const SOURCE_GUIDANCE: Record<string, string> = {
  web: "general web articles and analysis",
  news: "news articles and press coverage",
  pdfs: "research reports, whitepapers, and academic papers",
  blogs: "company blogs and thought leadership posts",
};

function buildSourceGuidance(enabled: string[]): string {
  const labels = enabled.map((s) => SOURCE_GUIDANCE[s]).filter(Boolean);
  return labels.length ? `Source type preference: prioritise ${labels.join(", ")}.` : "";
}
