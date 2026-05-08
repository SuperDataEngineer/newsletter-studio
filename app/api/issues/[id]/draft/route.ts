import { NextRequest, NextResponse } from "next/server";
import { processDraftJob } from "@/lib/workflows/generateDraft";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    if (!body.brief) {
      return NextResponse.json({ error: "brief is required in request body" }, { status: 400 });
    }

    const result = await processDraftJob({
      issueId: params.id,
      brief: body.brief,
      newsletterType: body.newsletterType,
      audience: body.audience,
      tone: body.tone,
      length: body.length,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[draft] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
