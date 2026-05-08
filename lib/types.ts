export type IssueStatus = "draft" | "review" | "published" | "archived";

export interface NewsletterIssue {
  id: string;
  userId: string;
  title: string | null;
  subtitle: string | null;
  topic: string;
  industry: string;
  newsletterType: string;
  audience: string;
  tone: string;
  length: string;
  sourcesEnabled: string[];
  companies: string[];
  keywords: string[];
  selectedSubjectIdx: number;
  score: number | null;
  subscores: ScoreSubscores | null;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  id: string;
  issueId: string;
  title: string;
  publisher: string;
  domain: string;
  url: string;
  sourceType: "web" | "news" | "pdf" | "company_blog" | "internal_note";
  credibilityScore: number;
  publishedAt: string | null;
  rawExcerpt: string | null;
}

export interface ResearchBrief {
  issueId: string;
  mainThesis: string;
  keyFindings: string[];
  suggestedAngle: string;
  contradictions: string[] | null;
  llmModel: string;
  generatedAt: string;
  sources: ResearchSource[];
}

export interface NewsletterDraft {
  issueId: string;
  hook: string;
  body: string;
  takeaways: string;
  cta: string;
  subjectLines: string[];
  previewTexts: string[];
  llmModel: string;
  generatedAt: string;
}

export interface ScoreSubscore {
  value: number;
  reason: string;
}

export interface ScoreSubscores {
  originality: ScoreSubscore;
  sourceStrength: ScoreSubscore;
  executiveRelevance: ScoreSubscore;
  clarity: ScoreSubscore;
  readability: ScoreSubscore;
}

export interface Recommendation {
  text: string;
  section: "hook" | "body" | "takeaways" | "cta" | "general";
}

export interface IssueScore {
  total: number;
  scores: ScoreSubscores;
  recommendations: Recommendation[];
  status: "ready" | "ready_with_refinements" | "needs_work";
}

export type DraftSection = "hook" | "body" | "takeaways" | "cta";

export type RefineAction =
  | "Rewrite Intro"
  | "Add Data"
  | "Make Sharper"
  | "Make More Executive"
  | "Expand"
  | "Add Examples"
  | "Add Source"
  | "Simplify"
  | "Shorten"
  | "Make Tactical"
  | "Make Executive"
  | "Make Bolder"
  | "Add CTA"
  | "Make Softer";

export interface RecentIssue {
  id: string;
  title: string;
  date: string;
  words: string;
  status: IssueStatus;
}
