// Deterministic source credibility scorer — §7 of the implementation plan

const DOMAIN_TIERS: Record<string, number> = {
  "gartner.com": 1.0, "mckinsey.com": 1.0, "bcg.com": 1.0,
  "hbr.org": 1.0, "nature.com": 1.0, "sec.gov": 1.0,
  "wsj.com": 0.85, "ft.com": 0.85, "bloomberg.com": 0.85,
  "economist.com": 0.85, "deloitte.com": 0.85, "pwc.com": 0.85,
  "techcrunch.com": 0.70, "theverge.com": 0.70, "axios.com": 0.70, "semafor.com": 0.70,
  "openai.com": 0.55, "anthropic.com": 0.55, "stripe.com": 0.55,
};

function recencyDecay(publishedAt: string | undefined, halflifeDays = 120): number {
  if (!publishedAt) return 0.5;
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  return Math.pow(0.5, ageDays / halflifeDays);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export interface RankInput {
  domain: string;
  publishedAt?: string;
  markdownLength: number;
  hasAuthor: boolean;
}

export function credibilityScore(source: RankInput): number {
  const tier = DOMAIN_TIERS[source.domain] ?? 0.4;
  const recency = recencyDecay(source.publishedAt);
  const lengthScore = clamp(source.markdownLength / 8000, 0, 1);
  const hasAuthor = source.hasAuthor ? 0.05 : 0;
  return 0.55 * tier + 0.25 * recency + 0.15 * lengthScore + hasAuthor;
}
