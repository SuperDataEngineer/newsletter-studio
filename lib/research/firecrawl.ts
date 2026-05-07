// Firecrawl page-to-markdown adapter — Phase 2
export interface FirecrawlPage {
  url: string;
  title: string;
  markdown: string;
  author?: string;
  publishedAt?: string;
}

export async function firecrawlScrape(url: string): Promise<FirecrawlPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not set");

  const res = await fetch("https://api.firecrawl.dev/v0/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
  });

  if (!res.ok) throw new Error(`Firecrawl error: ${res.statusText}`);
  const data = await res.json();
  return {
    url,
    title: data.data?.metadata?.title ?? "",
    markdown: data.data?.markdown ?? "",
    author: data.data?.metadata?.author,
    publishedAt: data.data?.metadata?.publishedTime,
  };
}
