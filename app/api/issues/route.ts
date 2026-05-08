import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ id: crypto.randomUUID(), ...body }, { status: 201 });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const db = createServerClient();
    let query = db
      .from("newsletter_issues")
      .select("id, title, topic, status, score, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (status) query = query.eq("status", status);
    else query = query.in("status", ["draft", "review", "published"]);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ issues: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
