// Phase 4: markdown export using turndown
export function draftToMarkdown(draft: {
  title: string; subtitle: string;
  hook: string; body: string; takeaways: string; cta: string;
  sources?: Array<{ title: string; url: string; domain: string }>;
}): string {
  const lines = [
    `# ${draft.title}`, `*${draft.subtitle}*`, "",
    `## Opening Hook`, draft.hook, "",
    `## Main Body`, draft.body, "",
    `## Key Takeaways`, draft.takeaways, "",
    `## Closing CTA`, draft.cta,
  ];

  if (draft.sources?.length) {
    lines.push("", "---", "**Sources**");
    draft.sources.forEach((s) => lines.push(`- [${s.title}](${s.url}) — ${s.domain}`));
  }

  return lines.join("\n");
}
