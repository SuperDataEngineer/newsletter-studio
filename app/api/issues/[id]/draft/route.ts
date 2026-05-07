import { NextRequest, NextResponse } from "next/server";

// POST /api/issues/[id]/draft — trigger draft generation (SSE stream)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const _body = await req.json();

  // TODO: stream Claude output using delimiter convention <<<HOOK>>> etc.
  const fixture = {
    issueId: params.id,
    hook: "Placeholder hook — wire Claude streaming in Phase 3.",
    body: "Placeholder body.",
    takeaways: "Placeholder takeaways.",
    cta: "Placeholder CTA.",
    subjectLines: ["Subject 1", "Subject 2", "Subject 3"],
    previewTexts: ["Preview 1", "Preview 2", "Preview 3"],
    llmModel: "stub",
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(fixture);
}
