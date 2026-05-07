// Exa semantic search adapter — Phase 2 fallback
export interface ExaResult {
  url: string;
  title: string;
  text: string;
  score: number;
  publishedDate?: string;
}

export async function exaSearch(query: string): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("EXA_API_KEY not set");

  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ query, numResults: 10, useAutoprompt: true }),
  });

  if (!res.ok) throw new Error(`Exa error: ${res.statusText}`);
  const data = await res.json();
  return data.results ?? [];
}
