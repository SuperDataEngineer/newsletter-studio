// Phase 3: SQS worker for brief generation
// This function will be deployed as a Lambda triggered by SQS_BRIEF_QUEUE_URL.
// For now it's a stub — the queue message shape is defined here so the
// API route and the worker stay in sync.

export interface BriefJobPayload {
  issueId: string;
  topic: string;
  newsletterType: string;
  audience: string;
  tone: string;
  length: string;
  companies: string[];
  keywords: string[];
  sourcesEnabled: string[];
}

export async function processBriefJob(payload: BriefJobPayload): Promise<void> {
  // TODO Phase 3:
  // 1. Tavily search(composeQuery(payload))
  // 2. Filter by credibility (lib/research/rank.ts)
  // 3. Firecrawl.scrape top-10 URLs
  // 4. Persist research_sources rows
  // 5. Call Claude with prompts/brief.ts
  // 6. Validate with BriefSchema
  // 7. Persist research_briefs row
  // 8. Emit completion event back to client
  console.log("[generateBrief] stub — issueId:", payload.issueId);
}
