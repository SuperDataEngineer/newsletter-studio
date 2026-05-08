import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/client";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("newsletter_issues")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const db = createServerClient();
    const { error } = await db
      .from("newsletter_issues")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ id: params.id, updatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = createServerClient();
    const { error } = await db
      .from("newsletter_issues")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ deleted: params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
