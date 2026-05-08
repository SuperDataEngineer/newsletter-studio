import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DraftSection,
  IssueScore,
  NewsletterDraft,
  ResearchBrief,
} from "@/lib/types";

// ── Mock data (Phase 1 fixtures) ──────────────────────────────────────────────

const MOCK_BRIEF: ResearchBrief = {
  issueId: "mock",
  mainThesis:
    "Enterprise brands that establish entity authority and citation density in AI-indexed content will own the next decade of B2B discovery, as answer engines increasingly bypass traditional rankings.",
  keyFindings: [
    "73% of enterprise buyers consult an AI assistant before engaging sales — Gartner, 2025.",
    "Share-of-answer is overtaking share-of-voice as the primary B2B visibility metric.",
    "Citation density from authoritative third-party sources is the #1 inclusion signal.",
    "Brands with structured entity coverage appear 4× more often in AI-generated answers.",
    "Current SEO measurement frameworks miss 60%+ of AI-driven discovery touchpoints.",
  ],
  suggestedAngle:
    "Frame this as a board-level visibility risk, not a marketing tactic. Lead with the measurement gap, then walk through the three entity-authority levers enterprise teams can pull in Q3.",
  contradictions: [
    "Some sources argue traditional SEO still dominates mid-funnel; AI discovery may be overstated for transactional queries.",
  ],
  llmModel: "claude-sonnet-4-5",
  generatedAt: new Date().toISOString(),
  sources: [
    { id: "s1", issueId: "mock", title: "Enterprise AI Study 2025", publisher: "Gartner", domain: "gartner.com", url: "https://gartner.com", sourceType: "web", credibilityScore: 0.94, publishedAt: "2025-03-15", rawExcerpt: null },
    { id: "s2", issueId: "mock", title: "AI Overviews Impact Report", publisher: "McKinsey", domain: "mckinsey.com", url: "https://mckinsey.com", sourceType: "web", credibilityScore: 0.91, publishedAt: "2025-04-01", rawExcerpt: null },
    { id: "s3", issueId: "mock", title: "Generative Search Brief", publisher: "BCG", domain: "bcg.com", url: "https://bcg.com", sourceType: "web", credibilityScore: 0.89, publishedAt: "2025-02-20", rawExcerpt: null },
    { id: "s4", issueId: "mock", title: "OpenAI Search & Discovery Notes", publisher: "OpenAI", domain: "openai.com", url: "https://openai.com", sourceType: "company_blog", credibilityScore: 0.72, publishedAt: "2025-04-10", rawExcerpt: null },
    { id: "s5", issueId: "mock", title: "Strategic Tech Trends", publisher: "Deloitte", domain: "deloitte.com", url: "https://deloitte.com", sourceType: "web", credibilityScore: 0.87, publishedAt: "2025-03-28", rawExcerpt: null },
    { id: "s6", issueId: "mock", title: "State of AI in Enterprise", publisher: "WSJ", domain: "wsj.com", url: "https://wsj.com", sourceType: "news", credibilityScore: 0.85, publishedAt: "2025-04-22", rawExcerpt: null },
  ],
};

const MOCK_DRAFT: NewsletterDraft = {
  issueId: "mock",
  hook: "AI search is reshaping how executives discover, evaluate, and decide. Here's what marketing leaders need to know to stay visible—and chosen.",
  body: "We break down the shift to answer-engine discovery, the signals that drive inclusion, and the metrics that reveal true visibility in AI experiences.",
  takeaways: "Three imperatives for enterprise brands—and the frameworks to turn visibility into measurable business impact.",
  cta: "Put this playbook into action. Align your team, audit your content, and start measuring what matters in AI-driven discovery.",
  subjectLines: [
    "The enterprise playbook for AI search visibility",
    "Win visibility in AI search. Here's how.",
    "AI search visibility: What leaders must do in 2026",
    "Your brand's next search problem is not Google",
    "How enterprise brands show up in AI answers",
  ],
  previewTexts: [
    "Practical frameworks and metrics to help enterprise marketing teams earn inclusion in AI search and drive measurable impact.",
    "A practical guide to improving how your brand appears in AI-generated answers.",
    "What enterprise marketers need to know about search, citations, and answer-engine visibility.",
    "The shift from rankings to AI answers is already underway. Here's how to prepare.",
    "How leading B2B brands are earning citations and inclusion across answer engines.",
  ],
  llmModel: "claude-sonnet-4-5",
  generatedAt: new Date().toISOString(),
};

const MOCK_SCORE: IssueScore = {
  total: 84,
  scores: {
    originality: { value: 17, reason: "Fresh angle on entity authority not widely covered." },
    sourceStrength: { value: 18, reason: "Gartner, McKinsey, BCG — tier-1 citations." },
    executiveRelevance: { value: 16, reason: "Board-level framing; strong for CDO/CMO audience." },
    clarity: { value: 17, reason: "Clear structure; three imperatives are distinct." },
    readability: { value: 16, reason: "Concise sentences; no jargon without definition." },
  },
  recommendations: [
    { text: "Add a specific metric or statistic to raise executive impact.", section: "hook" },
    { text: "Expand with one concrete action per takeaway bullet.", section: "takeaways" },
  ],
  status: "ready_with_refinements",
};

// ── Store ────────────────────────────────────────────────────────────────────

interface StudioState {
  // Issue identity
  issueId: string | null;

  // Issue config
  topic: string;
  industry: string;
  newsletterType: string;
  audience: string;
  tone: string;
  length: string;
  activeSources: Record<string, boolean>;
  companies: string[];
  keywords: string[];

  // Draft content
  title: string;
  subtitle: string;
  draft: Pick<NewsletterDraft, "hook" | "body" | "takeaways" | "cta">;
  subjectLines: string[];
  previewTexts: string[];
  selectedSubjectIdx: number;

  // Research
  brief: ResearchBrief | null;

  // Score
  score: IssueScore | null;

  // UI state
  currentTab: "Workspace" | "History" | "Templates" | "Settings";
  activeSection: DraftSection;
  briefLoading: boolean;
  draftLoading: boolean;
  scoreLoading: boolean;
  refiningSection: DraftSection | null;
  savedAt: string;

  // Actions
  setIssueId: (id: string) => void;
  setTopic: (v: string) => void;
  setIndustry: (v: string) => void;
  setNewsletterType: (v: string) => void;
  setAudience: (v: string) => void;
  setTone: (v: string) => void;
  setLength: (v: string) => void;
  toggleSource: (id: string) => void;
  addCompany: (c: string) => void;
  removeCompany: (c: string) => void;
  addKeyword: (k: string) => void;
  removeKeyword: (k: string) => void;
  setTitle: (v: string) => void;
  setSubtitle: (v: string) => void;
  setDraftSection: (section: DraftSection, text: string) => void;
  setSelectedSubjectIdx: (i: number) => void;
  setCurrentTab: (t: "Workspace" | "History" | "Templates" | "Settings") => void;
  setActiveSection: (s: DraftSection) => void;
  setBriefLoading: (v: boolean) => void;
  setDraftLoading: (v: boolean) => void;
  setScoreLoading: (v: boolean) => void;
  setRefiningSection: (s: DraftSection | null) => void;
  setSubjectLines: (lines: string[]) => void;
  setPreviewTexts: (texts: string[]) => void;
  setBrief: (b: ResearchBrief | null) => void;
  setScore: (s: IssueScore | null) => void;
  setSavedAt: (v: string) => void;

  // Issue management
  resetWorkspace: () => void;
  loadFromHistory: (data: {
    issueId: string;
    topic: string;
    industry: string;
    newsletterType: string;
    audience: string;
    tone: string;
    length: string;
    companies: string[];
    keywords: string[];
    title: string | null;
    subtitle: string | null;
    brief: ResearchBrief | null;
    draft: Pick<NewsletterDraft, "hook" | "body" | "takeaways" | "cta"> | null;
    subjectLines: string[];
    previewTexts: string[];
    score: IssueScore | null;
  }) => void;
  cloneConfig: (data: {
    topic: string;
    industry: string;
    newsletterType: string;
    audience: string;
    tone: string;
    length: string;
    companies: string[];
    keywords: string[];
  }) => void;

  // Seed mock data
  loadMockData: () => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
  issueId: null,

  topic: "How enterprise brands can improve AI search visibility in 2026, and what marketing leaders should know about generative discovery, citations, and answer-engine measurement.",
  industry: "Technology & Software",
  newsletterType: "Insight / Analysis",
  audience: "Enterprise Leaders",
  tone: "Boardroom-ready, analytical",
  length: "Medium · 800–1,000 words",
  activeSources: { web: true, news: true, pdfs: true, blogs: true },
  companies: ["Microsoft", "OpenAI", "Salesforce"],
  keywords: ["acquisitions", "expansions", "AI partnerships"],

  title: "AI Search Visibility: The Enterprise Playbook",
  subtitle: "How brands win the next discovery layer",
  draft: {
    hook: MOCK_DRAFT.hook,
    body: MOCK_DRAFT.body,
    takeaways: MOCK_DRAFT.takeaways,
    cta: MOCK_DRAFT.cta,
  },
  subjectLines: MOCK_DRAFT.subjectLines,
  previewTexts: MOCK_DRAFT.previewTexts,
  selectedSubjectIdx: 0,

  brief: MOCK_BRIEF,
  score: MOCK_SCORE,

  currentTab: "Workspace",
  activeSection: "hook",
  briefLoading: false,
  draftLoading: false,
  scoreLoading: false,
  refiningSection: null,
  savedAt: "2m ago",

  setIssueId: (id) => set({ issueId: id }),
  setTopic: (v) => set({ topic: v }),
  setIndustry: (v) => set({ industry: v }),
  setNewsletterType: (v) => set({ newsletterType: v }),
  setAudience: (v) => set({ audience: v }),
  setTone: (v) => set({ tone: v }),
  setLength: (v) => set({ length: v }),
  toggleSource: (id) =>
    set((s) => ({ activeSources: { ...s.activeSources, [id]: !s.activeSources[id] } })),
  addCompany: (c) => set((s) => ({ companies: [...s.companies, c] })),
  removeCompany: (c) => set((s) => ({ companies: s.companies.filter((x) => x !== c) })),
  addKeyword: (k) => set((s) => ({ keywords: [...s.keywords, k] })),
  removeKeyword: (k) => set((s) => ({ keywords: s.keywords.filter((x) => x !== k) })),
  setTitle: (v) => set({ title: v }),
  setSubtitle: (v) => set({ subtitle: v }),
  setDraftSection: (section, text) =>
    set((s) => ({ draft: { ...s.draft, [section]: text } })),
  setSelectedSubjectIdx: (i) => set({ selectedSubjectIdx: i }),
  setCurrentTab: (t) => set({ currentTab: t }),
  setActiveSection: (s) => set({ activeSection: s }),
  setBriefLoading: (v) => set({ briefLoading: v }),
  setDraftLoading: (v) => set({ draftLoading: v }),
  setScoreLoading: (v) => set({ scoreLoading: v }),
  setRefiningSection: (s) => set({ refiningSection: s }),
  setSubjectLines: (lines) => set({ subjectLines: lines }),
  setPreviewTexts: (texts) => set({ previewTexts: texts }),
  setBrief: (b) => set({ brief: b }),
  setScore: (s) => set({ score: s }),
  setSavedAt: (v) => set({ savedAt: v }),

  resetWorkspace: () =>
    set({
      issueId: null,
      title: "",
      subtitle: "",
      draft: { hook: "", body: "", takeaways: "", cta: "" },
      subjectLines: [],
      previewTexts: [],
      brief: null,
      score: null,
      currentTab: "Workspace",
    }),

  loadFromHistory: (data) =>
    set({
      issueId: data.issueId,
      topic: data.topic,
      industry: data.industry ?? "Not industry-specific",
      newsletterType: data.newsletterType,
      audience: data.audience,
      tone: data.tone,
      length: data.length,
      companies: data.companies ?? [],
      keywords: data.keywords ?? [],
      title: data.title ?? "",
      subtitle: data.subtitle ?? "",
      brief: data.brief,
      draft: data.draft ?? { hook: "", body: "", takeaways: "", cta: "" },
      subjectLines: data.subjectLines,
      previewTexts: data.previewTexts,
      score: data.score,
      currentTab: "Workspace",
    }),

  cloneConfig: (data) =>
    set({
      issueId: null,
      topic: data.topic,
      industry: data.industry ?? "Not industry-specific",
      newsletterType: data.newsletterType,
      audience: data.audience,
      tone: data.tone,
      length: data.length,
      companies: data.companies ?? [],
      keywords: data.keywords ?? [],
      title: "",
      subtitle: "",
      draft: { hook: "", body: "", takeaways: "", cta: "" },
      subjectLines: [],
      previewTexts: [],
      brief: null,
      score: null,
      currentTab: "Workspace",
    }),

  loadMockData: () =>
    set({
      brief: MOCK_BRIEF,
      score: MOCK_SCORE,
      draft: { hook: MOCK_DRAFT.hook, body: MOCK_DRAFT.body, takeaways: MOCK_DRAFT.takeaways, cta: MOCK_DRAFT.cta },
      subjectLines: MOCK_DRAFT.subjectLines,
      previewTexts: MOCK_DRAFT.previewTexts,
    }),
    }),
    {
      name: "newsletter-studio",
      // Persist everything except transient loading flags
      partialize: (state) => ({
        issueId: state.issueId,
        topic: state.topic,
        industry: state.industry,
        newsletterType: state.newsletterType,
        audience: state.audience,
        tone: state.tone,
        length: state.length,
        activeSources: state.activeSources,
        companies: state.companies,
        keywords: state.keywords,
        title: state.title,
        subtitle: state.subtitle,
        draft: state.draft,
        subjectLines: state.subjectLines,
        previewTexts: state.previewTexts,
        selectedSubjectIdx: state.selectedSubjectIdx,
        brief: state.brief,
        score: state.score,
        savedAt: state.savedAt,
      }),
    }
  )
);
