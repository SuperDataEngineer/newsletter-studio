import { NextRequest, NextResponse } from "next/server";
import { createClaudeClient, MODEL_FAST } from "@/lib/ai/claude";

const REFINE_INSTRUCTIONS: Record<string, string> = {
  "Rewrite Intro": "Rewrite the opening to be more attention-grabbing. Keep the same core message but make the first sentence impossible to ignore.",
  "Add Data": "Add a specific statistic, percentage, or data point to strengthen the argument. If no data is in the brief, extrapolate a reasonable claim with appropriate hedging.",
  "Make Sharper": "Cut filler words and weak phrases. Make every sentence earn its place. Shorter, punchier.",
  "Make More Executive": "Reframe for a C-suite reader. Lead with business impact, use board-level language, remove tactical detail.",
  "Expand": "Expand with more depth, examples, and supporting context. Aim for 50% more content without padding.",
  "Add Examples": "Add 1–2 concrete, specific examples or case studies to make the point tangible.",
  "Add Source": "Weave in a source citation inline (use a plausible domain like mckinsey.com, hbr.org, or gartner.com if no specific source is available).",
  "Simplify": "Simplify the language. Write at a clear, direct level. Remove jargon and complex sentence structures.",
  "Shorten": "Cut by 30–40%. Remove redundancy. Keep only the highest-value sentences.",
  "Make Tactical": "Rewrite with specific, actionable steps a practitioner can execute this week.",
  "Make Executive": "Reframe for a senior executive. Emphasise strategic implications and business outcomes.",
  "Make Bolder": "Make the call to action more direct and urgent. Remove hedging. Tell the reader exactly what to do and why now.",
  "Add CTA": "Add or strengthen a clear call to action at the end.",
  "Make Softer": "Soften the tone. Make it feel like a recommendation rather than a command.",
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { section, action, currentText, customInstruction } = await req.json();

    const instruction = customInstruction ?? REFINE_INSTRUCTIONS[action] ?? `Apply this edit: ${action}`;
    const client = createClaudeClient();

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 2000,
      system: "You are a newsletter editor. Apply the requested edit and return ONLY the revised text — no preamble, no explanation, no quotes around the output.",
      messages: [
        {
          role: "user",
          content: `Section: ${section}\n\nCurrent text:\n${currentText}\n\nEdit instruction: ${instruction}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text returned");

    return NextResponse.json({ section, text: textBlock.text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message ?? JSON.stringify(err);
    console.error("[refine] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
