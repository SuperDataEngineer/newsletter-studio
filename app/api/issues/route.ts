import { NextRequest, NextResponse } from "next/server";

// POST /api/issues — create a new issue
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: validate with zod, insert into supabase, return issue
  return NextResponse.json({ id: crypto.randomUUID(), ...body }, { status: 201 });
}

// GET /api/issues — list issues for the current user
export async function GET() {
  // TODO: query supabase with auth context
  return NextResponse.json({ issues: [] });
}
