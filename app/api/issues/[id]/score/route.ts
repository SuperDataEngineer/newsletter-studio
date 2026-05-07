import { NextRequest, NextResponse } from "next/server";

// POST /api/issues/[id]/score — score the current draft
export async function POST(req: NextRequest, { params: _params }: { params: { id: string } }) {
  const _body = await req.json();

  // TODO: call GPT-4.1-mini with prompts/score.ts
  const fixture = {
    total: 84,
    scores: {
      originality: { value: 17, reason: "Stub." },
      sourceStrength: { value: 18, reason: "Stub." },
      executiveRelevance: { value: 16, reason: "Stub." },
      clarity: { value: 17, reason: "Stub." },
      readability: { value: 16, reason: "Stub." },
    },
    recommendations: [],
    status: "ready_with_refinements",
  };

  return NextResponse.json(fixture);
}
