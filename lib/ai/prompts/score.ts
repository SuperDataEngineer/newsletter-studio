interface ScorePromptInput {
  draft: { hook: string; body: string; takeaways: string; cta: string };
  brief: string;
  sources: Array<{ domain: string; credibilityScore: number }>;
  audience: string;
}

export function buildScorePrompt(input: ScorePromptInput): { system: string; user: string } {
  const system = `You are an editorial quality scorer. Evaluate newsletters on 5 dimensions, each 0-20 pts (total 0-100). Be critical and specific. Return valid JSON.`;

  const user = `Score this newsletter draft for a **${input.audience}** audience.

**Hook:** ${input.draft.hook}
**Body (excerpt):** ${input.draft.body.slice(0, 800)}
**Takeaways:** ${input.draft.takeaways}
**CTA:** ${input.draft.cta}
**Top sources:** ${input.sources.map((s) => `${s.domain} (cred: ${s.credibilityScore.toFixed(2)})`).join(", ")}
**Brief context:** ${input.brief.slice(0, 400)}

Score dimensions (0-20 each): originality, sourceStrength, executiveRelevance, clarity, readability.

For each recommendation, assign the section where the change must be made:
- "hook" — fix the opening paragraph/hook
- "body" — fix the main body content, arguments, data, or structure
- "takeaways" — fix the key takeaways or bullets
- "cta" — fix the call to action
- "general" — ONLY use this if the issue truly spans every section equally (e.g. overall tone)

Almost every recommendation targets a specific section. Default to the most relevant section, not "general".

Return JSON: { total, scores: { originality: {value, reason}, ... }, recommendations: [{ text: string, section: "hook"|"body"|"takeaways"|"cta"|"general" }] (max 3), status: "ready"|"ready_with_refinements"|"needs_work" }`;

  return { system, user };
}
