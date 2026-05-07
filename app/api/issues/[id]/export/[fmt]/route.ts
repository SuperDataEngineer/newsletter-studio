import { NextRequest, NextResponse } from "next/server";

// GET /api/issues/[id]/export/[fmt] — download in requested format
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; fmt: string } }
) {
  // TODO: implement pdf, md, html exports
  return NextResponse.json(
    { error: `Export format '${params.fmt}' not yet implemented` },
    { status: 501 }
  );
}
