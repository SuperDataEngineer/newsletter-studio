import { NextRequest, NextResponse } from "next/server";
import { createClaudeClient, MODEL_FAST } from "@/lib/ai/claude";
import { buildScorePrompt } from "@/lib/ai/prompts/score";
import { createServerClient } from "@/lib/db/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { draft, brief, audience } = body;

    if (!draft || !brief) {
      return NextResponse.json({ error: "draft and brief are required" }, { status: 400 });
    }

    const client = createClaudeClient();
    const briefSummary = [brief.mainThesis, ...(brief.keyFindings ?? [])].join(" | ");

    const { system, user } = buildScorePrompt({
      draft,
      brief: briefSummary,
      sources: (brief.sources ?? []).map((s: { domain: string; credibilityScore: number }) => ({
        domain: s.domain,
        credibilityScore: s.credibilityScore ?? 0.5,
      })),
      audience: audience ?? "Enterprise Leaders",
    });

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text from Claude");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in score response");

    const score = JSON.parse(jsonMatch[0]);

    // Recalculate total from subscores — don't trust Claude's arithmetic
    if (score.scores) {
      score.total = Object.values(score.scores as Record<string, { value: number }>)
        .reduce((sum, s) => sum + (s.value ?? 0), 0);
    }

    // Persist to Supabase
    const db = createServerClient();
    await db
      .from("newsletter_issues")
      .update({ score: score.total, subscores: score.scores, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    return NextResponse.json(score);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[score] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
