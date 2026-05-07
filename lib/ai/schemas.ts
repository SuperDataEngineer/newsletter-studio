import { z } from "zod";

export const BriefSchema = z.object({
  mainThesis: z.string().max(400),
  keyFindings: z.array(z.string()).min(3).max(5),
  suggestedAngle: z.string().max(500),
  sourceRanking: z.array(
    z.object({
      sourceId: z.string(),
      relevance: z.number().min(0).max(1),
      citationWorthy: z.boolean(),
    })
  ),
  contradictions: z.array(z.string()).optional(),
});
export type Brief = z.infer<typeof BriefSchema>;

export const DraftSchema = z.object({
  title: z.string().max(80),
  subtitle: z.string().max(120),
  hook: z.string().max(500),
  body: z.string().max(3500),
  takeaways: z.string().max(800),
  cta: z.string().max(400),
  subjectLines: z.array(z.string().max(80)).length(5),
  previewText: z.array(z.string().max(140)).length(5),
});
export type Draft = z.infer<typeof DraftSchema>;

export const RefineSchema = z.object({ text: z.string() });
export type Refine = z.infer<typeof RefineSchema>;

export const ScoreSchema = z.object({
  total: z.number().int().min(0).max(100),
  scores: z.object({
    originality: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    sourceStrength: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    executiveRelevance: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    clarity: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    readability: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
  }),
  recommendations: z.array(z.string()).max(3),
  status: z.enum(["ready", "ready_with_refinements", "needs_work"]),
});
export type Score = z.infer<typeof ScoreSchema>;

export const KeywordsSuggestSchema = z.object({
  keywords: z.array(z.string()).max(6),
});
export type KeywordsSuggest = z.infer<typeof KeywordsSuggestSchema>;
