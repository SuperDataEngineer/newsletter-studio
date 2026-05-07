import { NextRequest, NextResponse } from "next/server";

// POST /api/sources/search — Tavily / Exa wrapper
export async function POST(req: NextRequest) {
  const { query } = await req.json();
  // TODO: call Tavily, fall back to Exa, run credibility scorer
  return NextResponse.json({ query, results: [] });
}
