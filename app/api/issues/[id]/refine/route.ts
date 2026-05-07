import { NextRequest, NextResponse } from "next/server";

// POST /api/issues/[id]/refine — refine a section synchronously
export async function POST(req: NextRequest, { params: _params }: { params: { id: string } }) {
  const { section, action, currentText } = await req.json();

  // TODO: call GPT-4.1-mini (short actions) or Claude (long-form actions)
  return NextResponse.json({
    section,
    action,
    text: `[${action} applied to ${section}] ${currentText}`,
  });
}
