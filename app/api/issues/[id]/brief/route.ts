import { NextRequest, NextResponse } from "next/server";

// POST /api/issues/[id]/brief — trigger brief generation (SSE stream)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const _body = await req.json();

  // TODO: enqueue Inngest job 'brief.generate' and return SSE stream
  // Phase 1: return fixture data immediately
  const fixture = {
    issueId: params.id,
    mainThesis: "Placeholder thesis — wire Inngest + Claude in Phase 2.",
    keyFindings: ["Finding 1", "Finding 2", "Finding 3"],
    suggestedAngle: "Placeholder angle.",
    contradictions: [],
    llmModel: "stub",
    generatedAt: new Date().toISOString(),
    sources: [],
  };

  return NextResponse.json(fixture);
}
