import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/client";
import { processBriefJob } from "@/lib/workflows/generateBrief";

export const maxDuration = 60;

// POST /api/issues/[id]/brief — generate research brief
// Pass id="new" to create the issue atomically on first run.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const db = createServerClient();
    let issueId = params.id;

    if (params.id === "new") {
      const { data: issue, error } = await db
        .from("newsletter_issues")
        .insert({
          topic: body.topic,
          newsletter_type: body.newsletterType,
          audience: body.audience,
          tone: body.tone,
          length: body.length,
          companies: body.companies ?? [],
          keywords: body.keywords ?? [],
          sources_enabled: body.sourcesEnabled ?? ["web", "news"],
          status: "draft",
        })
        .select("id")
        .single();

      if (error) throw error;
      issueId = issue.id;
    } else {
      // Update existing issue config before regenerating
      await db
        .from("newsletter_issues")
        .update({
          topic: body.topic,
          newsletter_type: body.newsletterType,
          audience: body.audience,
          tone: body.tone,
          length: body.length,
          companies: body.companies ?? [],
          keywords: body.keywords ?? [],
          sources_enabled: body.sourcesEnabled ?? ["web", "news"],
          updated_at: new Date().toISOString(),
        })
        .eq("id", issueId);

      // Delete old sources so we get a fresh set
      await db.from("research_sources").delete().eq("issue_id", issueId);
    }

    const brief = await processBriefJob({
      issueId,
      topic: body.topic,
      industry: body.industry ?? "Not industry-specific",
      newsletterType: body.newsletterType,
      audience: body.audience,
      tone: body.tone,
      length: body.length,
      companies: body.companies ?? [],
      keywords: body.keywords ?? [],
      sourcesEnabled: body.sourcesEnabled ?? ["web", "news"],
    });

    return NextResponse.json({ issueId, brief });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    console.error("[brief] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
