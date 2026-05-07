import { inngest } from "./inngestClient";

// Phase 2: implement the full pipeline
export const generateBrief = inngest.createFunction(
  { id: "brief.generate", name: "Generate Research Brief" },
  { event: "brief/generate" },
  async ({ event, step }) => {
    const { issueId } = event.data as { issueId: string };

    await step.run("placeholder", async () => {
      console.log(`[brief.generate] issueId=${issueId} — TODO: implement in Phase 2`);
    });

    return { issueId, status: "stub" };
  }
);
