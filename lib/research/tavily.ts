// Tavily search adapter — Phase 2 implementation
export interface TavilyResult {
  url: string;
  title: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export async function tavilySearch(query: string, _options?: { days?: number }): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not set");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 10,
    }),
  });

  if (!res.ok) throw new Error(`Tavily error: ${res.statusText}`);
  const data = await res.json();
  return data.results ?? [];
}
