import { NextRequest, NextResponse } from "next/server";

// POST /api/companies/news — fetch news for watchlist companies
export async function POST(req: NextRequest) {
  const { companies, keywords } = await req.json();
  // TODO: Tavily news search per company, upsert company_news table
  return NextResponse.json({ companies, keywords, articles: [] });
}
