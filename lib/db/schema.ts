import {
  pgTable, pgEnum, uuid, text, integer, numeric,
  timestamp, jsonb, bigserial, boolean,
} from "drizzle-orm/pg-core";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const issueStatusEnum = pgEnum("issue_status", [
  "draft", "review", "published", "archived",
]);

// ── Users ─────────────────────────────────────────────────────────────────────
// Auth deferred — no FK to Cognito yet. user_id is nullable across tables
// until Cognito is wired in Phase 7.

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  workspaceName: text("workspace_name"),
  brandVoice: jsonb("brand_voice"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Newsletter Issues ─────────────────────────────────────────────────────────

export const newsletterIssues = pgTable("newsletter_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  subtitle: text("subtitle"),
  topic: text("topic"),
  newsletterType: text("newsletter_type"),
  audience: text("audience"),
  tone: text("tone"),
  length: text("length"),
  sourcesEnabled: text("sources_enabled").array().default(["web", "news", "pdfs", "blogs"]),
  companies: text("companies").array().default([]),
  keywords: text("keywords").array().default([]),
  selectedSubjectIdx: integer("selected_subject_idx").default(0),
  score: integer("score"),
  subscores: jsonb("subscores"),
  status: issueStatusEnum("status").default("draft"),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Research Briefs ───────────────────────────────────────────────────────────

export const researchBriefs = pgTable("research_briefs", {
  issueId: uuid("issue_id").primaryKey().references(() => newsletterIssues.id, { onDelete: "cascade" }),
  mainThesis: text("main_thesis"),
  keyFindings: text("key_findings").array(),
  suggestedAngle: text("suggested_angle"),
  contradictions: text("contradictions").array(),
  llmModel: text("llm_model"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

// ── Research Sources ──────────────────────────────────────────────────────────

export const researchSources = pgTable("research_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id").references(() => newsletterIssues.id, { onDelete: "cascade" }),
  title: text("title"),
  publisher: text("publisher"),
  domain: text("domain"),
  url: text("url"),
  sourceType: text("source_type"),
  credibilityScore: numeric("credibility_score"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  rawExcerpt: text("raw_excerpt"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Newsletter Drafts ─────────────────────────────────────────────────────────

export const newsletterDrafts = pgTable("newsletter_drafts", {
  issueId: uuid("issue_id").primaryKey().references(() => newsletterIssues.id, { onDelete: "cascade" }),
  hook: text("hook"),
  body: text("body"),
  takeaways: text("takeaways"),
  cta: text("cta"),
  subjectLines: text("subject_lines").array(),
  previewTexts: text("preview_texts").array(),
  llmModel: text("llm_model"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

// ── Export Events ─────────────────────────────────────────────────────────────

export const exportEvents = pgTable("export_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  issueId: uuid("issue_id").references(() => newsletterIssues.id, { onDelete: "cascade" }),
  format: text("format"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Company News ──────────────────────────────────────────────────────────────

export const companyNews = pgTable("company_news", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  company: text("company"),
  title: text("title"),
  url: text("url").unique(),
  domain: text("domain"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type NewsletterIssue = typeof newsletterIssues.$inferSelect;
export type NewNewsletterIssue = typeof newsletterIssues.$inferInsert;
export type ResearchBrief = typeof researchBriefs.$inferSelect;
export type ResearchSource = typeof researchSources.$inferSelect;
export type NewsletterDraft = typeof newsletterDrafts.$inferSelect;
export type CompanyNews = typeof companyNews.$inferSelect;
