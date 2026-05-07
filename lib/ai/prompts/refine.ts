import type { DraftSection, RefineAction } from "@/lib/types";

interface RefinePromptInput {
  section: DraftSection;
  action: RefineAction;
  currentText: string;
  brief: string;
  audience: string;
  tone: string;
}

export function buildRefinePrompt(input: RefinePromptInput): { system: string; user: string } {
  const system = `You are a senior editorial coach. Rewrite the provided newsletter section according to the given action. Match the existing tone and length unless the action explicitly asks to change them. Return JSON: { text: string }.`;

  const user = `**Section:** ${input.section}
**Action:** ${input.action}
**Audience:** ${input.audience} | **Tone:** ${input.tone}
**Brief context:** ${input.brief.slice(0, 400)}

**Current text:**
${input.currentText}

Apply "${input.action}" and return the improved text as JSON { text: "..." }.`;

  return { system, user };
}
