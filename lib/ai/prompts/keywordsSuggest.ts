export function buildKeywordsSuggestPrompt(topic: string): { system: string; user: string } {
  return {
    system: `You are a B2B content strategist. Given a newsletter topic, return 6 high-value keyword phrases that would improve research specificity. Return JSON: { keywords: string[] }.`,
    user: `Topic: "${topic}"\nReturn 6 targeted keyword phrases.`,
  };
}
