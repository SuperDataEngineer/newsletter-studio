import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/client";

// GET /api/issues/[id]/load — fetch full issue data for workspace hydration
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = createServerClient();

    const [issueRes, briefRes, sourcesRes, draftRes] = await Promise.all([
      db.from("newsletter_issues").select("*").eq("id", params.id).single(),
      db.from("research_briefs").select("*").eq("issue_id", params.id).single(),
      db.from("research_sources").select("*").eq("issue_id", params.id).order("credibility_score", { ascending: false }),
      db.from("newsletter_drafts").select("*").eq("issue_id", params.id).single(),
    ]);

    if (issueRes.error) throw issueRes.error;

    const issue = issueRes.data;
    const brief = briefRes.data ?? null;
    const sources = sourcesRes.data ?? [];
    const draft = draftRes.data ?? null;

    return NextResponse.json({ issue, brief, sources, draft });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
