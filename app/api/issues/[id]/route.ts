import { NextRequest, NextResponse } from "next/server";

// GET /api/issues/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: fetch from supabase, check ownership
  return NextResponse.json({ id: params.id });
}

// PATCH /api/issues/[id] — autosave
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  // TODO: validate, update supabase, return { updatedAt, version }
  return NextResponse.json({ id: params.id, updatedAt: new Date().toISOString(), ...body });
}

// DELETE /api/issues/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: soft-delete in supabase
  return NextResponse.json({ deleted: params.id });
}
