# AI Research & Newsletter Studio — Implementation Plan

> **Hand-off doc for Claude Code.** Pair this with the existing HTML/JSX mockup (`AI Research & Newsletter Studio.html`, `studio.jsx`, `studio.css`) and `newsletter.md` (product spec). The mockup is the visual + interaction contract. This doc tells you how to make it real.

---

## 0. Goal

Turn the existing static + locally-stateful prototype into a production single-page web app that:

1. Takes a topic, configuration, **company watchlist**, and **keyword filters** from the user.
2. Runs live web research via search + crawl APIs.
3. Synthesizes a **Research Brief** (thesis, key findings, suggested angle, ranked sources).
4. Generates a structured **Newsletter Draft** (title, subtitle, hook, body, takeaways, CTA, subject lines, preview text).
5. Scores the draft on 5 quality dimensions and supports targeted **section refinement** actions.
6. Persists drafts and exports to Copy / Markdown / HTML / PDF (Substack/Beehiiv/Ghost as v2 stubs).

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | API routes, server actions, edge streaming, SSR for shareable issue URLs. |
| UI | **Tailwind CSS + shadcn/ui + lucide-react** | Matches the prototype tokens; shadcn primitives for Dialog/Dropdown/Toast. |
| State | **Zustand** for workspace state, **React Query** for server data | Workspace state is mostly local; server data is cacheable per `issueId`. |
| Forms | **react-hook-form + zod** | Strict validation on every AI-bound payload. |
| Auth | **Supabase Auth** (email + magic link) | Cheap, fast, OSS. |
| DB | **Supabase Postgres** | See schema in §6. |
| Storage | **Supabase Storage** | Uploaded PDFs, brand assets. |
| LLM — drafting | **Claude Sonnet 4.5** (`anthropic` SDK) | Long-form editorial quality. |
| LLM — extraction & scoring | **GPT-4.1-mini** (`openai` SDK) | Cheap structured JSON. |
| Search / discovery | **Tavily** (primary) + **Exa** (semantic fallback) | Tavily for breadth; Exa for "find similar to this thesis". |
| Crawling | **Firecrawl** | Markdown-clean page fetch for citation extraction. |
| PDF export | **react-pdf/renderer** server-side | Editorial layout fidelity. |
| Markdown export | `turndown` from internal HTML | Clean Substack-importable .md. |
| Queues | **Inngest** (or BullMQ on Upstash Redis) | Background generate / score jobs; retries; observability. |
| Observability | **OpenTelemetry → Honeycomb**, **Helicone** for LLM traces | Per-issue cost & latency. |
| Deploy | **Vercel** (web), **Supabase Cloud** (DB), **Inngest Cloud** (jobs) | Standard. |

---

## 2. Repo layout

```
apps/web/
  app/
    (workspace)/
      layout.tsx
      page.tsx                  # the 3-column studio
    api/
      issues/route.ts           # POST create, GET list
      issues/[id]/route.ts      # GET, PATCH (autosave), DELETE
      issues/[id]/brief/route.ts        # POST -> SSE stream
      issues/[id]/draft/route.ts        # POST -> SSE stream
      issues/[id]/refine/route.ts       # POST {section, action}
      issues/[id]/score/route.ts        # POST
      issues/[id]/export/[fmt]/route.ts # GET pdf/md/html/copy
      sources/search/route.ts   # POST -> Tavily/Exa wrapper
      companies/news/route.ts   # POST -> watchlist news
  components/                   # mirrors mockup; promote each subcomponent to its own file
    studio/
      LeftPanel.tsx
      CenterPanel.tsx
      RightPanel.tsx
      DraftBlock.tsx
      ScoreRing.tsx
      TagInputSection.tsx       # already designed in mockup
      SourceCard.tsx
      ExportTile.tsx
  lib/
    ai/
      claude.ts                 # streaming wrapper
      openai.ts
      prompts/                  # one file per prompt; see §4
        brief.ts
        draft.ts
        refine.ts
        score.ts
        subjectLines.ts
      schemas.ts                # zod schemas for every AI output
    research/
      tavily.ts
      exa.ts
      firecrawl.ts
      rank.ts                   # credibility scoring
    db/
      client.ts                 # supabase server client
      queries/
    workflows/                  # Inngest functions
      generateBrief.ts
      generateDraft.ts
      scoreIssue.ts
      refreshCompanyNews.ts     # cron, every 6h
    export/
      pdf.tsx
      markdown.ts
      html.ts
  store/
    useStudio.ts                # zustand store mirroring mockup state
packages/shared/
  types.ts                      # NewsletterIssue, ResearchBrief, etc.
```

---

## 3. UI sections — what is static vs AI-generated

> Use this table when wiring the mockup. **AI-generated** means the value comes from an LLM call; **Tool-driven** means a non-LLM API (search, crawler, DB).

### Left column — Issue setup

| Section | Source | Notes |
|---|---|---|
| Topic textarea | User input | Persisted on every keystroke (debounced 600ms PATCH). |
| Newsletter Type / Audience / Tone / Length | User input (presets) | Drives prompt parameters. |
| **Company news (tag input)** | User input + suggestions | Suggestions come from `/api/companies/suggest` which queries DB of previously-tracked companies + a small curated seed list. Every company added triggers `refreshCompanyNews` job. |
| **Keywords (tag input)** | User input + AI-suggested | After topic is typed, debounce 1.5s → call `/api/keywords/suggest` (GPT-4.1-mini) which returns 6 candidate keywords from the topic. User accepts via chip click. |
| Research sources (chips) | User toggles | Drives which adapters are called by the brief workflow. Locked sources show "coming soon" toast. |
| Generate Research Brief button | Triggers `/api/issues/[id]/brief` (SSE) | See §5.1. |

### Center column — Research Brief

| Section | Source | Notes |
|---|---|---|
| Step header / source count badge | Computed | `sources.length` from brief. |
| **Main Thesis** | **AI-generated** (Claude) | One paragraph, ≤ 60 words. |
| **Key Findings** | **AI-generated** (Claude) | Array of 3–5 bullets, each ≤ 25 words, citation-grounded. |
| **Suggested Angle** | **AI-generated** (Claude) | One paragraph, editorial framing. |
| Source cards (6) | **Tool-driven** (Tavily + Firecrawl) | Top-N by credibility score (§7). Logo letter is derived from domain; domain favicon fetched async and cached. |
| Generate Newsletter Draft button | Triggers `/api/issues/[id]/draft` (SSE) | Requires brief to exist. |

### Center column — Newsletter Draft

| Section | Source | Notes |
|---|---|---|
| Title headline | **AI-generated** (Claude), user-editable | Persists on blur. |
| Subtitle / deck | **AI-generated** (Claude), user-editable | Same. |
| Opening Hook block | **AI-generated** | Refinable via action chips → `/api/issues/[id]/refine`. |
| Main Body block | **AI-generated** | Same. Richer prompt: must cite ≥ 2 source IDs from brief. |
| Key Takeaways block | **AI-generated** | Same. |
| Closing CTA block | **AI-generated** | Same. |
| Auto-saved indicator | Computed from last successful PATCH | Shows relative time. |
| Subject line options (3) | **AI-generated** (GPT-4.1-mini, structured JSON) | Generated alongside draft; user selects one. |
| Preview text | **AI-generated** | One per subject line. Selecting subject swaps preview. |

### Right column — Quality + Publish

| Section | Source | Notes |
|---|---|---|
| Issue Score ring (0–100) | **AI-generated** (GPT-4.1-mini, JSON) | Sum of 5 sub-scores. Triggered automatically after draft + after each refine. |
| Sub-scores (Originality / Source Strength / Executive Relevance / Clarity / Readability) | **AI-generated** | Each 0–20 with rationale. |
| Status message + note | **AI-generated** | Derived from sub-scores: `ready` ≥ 80, `needs work` 60–79, `rebuild` < 60. |
| Recent issues | **DB query** | `select * from newsletter_issues where user_id=$1 order by updated_at desc limit 8`. |
| Export tiles | Local action → API | Copy uses Clipboard API directly; others stream a download. |

---

## 4. Prompts (canonical)

Keep all prompts versioned in `lib/ai/prompts/*.ts` and exported as pure functions returning `{system, user}`. Every prompt **must** request structured JSON validated by a zod schema in `lib/ai/schemas.ts`.

### 4.1 `prompts/brief.ts`

**Inputs:** `topic, type, audience, tone, length, companies, keywords, rawSources[]` (Firecrawl markdown for top ~10 candidates).

**Output schema:**
```ts
z.object({
  mainThesis: z.string().max(400),
  keyFindings: z.array(z.string()).min(3).max(5),
  suggestedAngle: z.string().max(500),
  sourceRanking: z.array(z.object({
    sourceId: z.string(),
    relevance: z.number().min(0).max(1),
    citationWorthy: z.boolean(),
  })),
  contradictions: z.array(z.string()).optional(),
})
```

**System role:** "You are an editorial research analyst at a Tier-1 strategy firm. You synthesize web sources into investor-grade research briefs. Cite by sourceId only. Never invent facts."

### 4.2 `prompts/draft.ts`

**Inputs:** `brief, type, audience, tone, length, brandVoice?`.

**Output schema:**
```ts
z.object({
  title: z.string().max(80),
  subtitle: z.string().max(120),
  hook: z.string().max(500),
  body: z.string().max(3500),
  takeaways: z.string().max(800),
  cta: z.string().max(400),
  subjectLines: z.array(z.string().max(80)).length(5),
  previewText: z.array(z.string().max(140)).length(5),
})
```

`subjectLines[i]` pairs with `previewText[i]` so the UI can swap atomically.

### 4.3 `prompts/refine.ts`

**Inputs:** `section ('hook'|'body'|'takeaways'|'cta'), action (string), currentText, brief, audience, tone`.

**Output schema:** `z.object({ text: z.string() })`.

Action vocabulary is closed:
```
Rewrite Intro | Add Data | Make Sharper | Make More Executive
Expand | Add Examples | Add Source | Simplify
Shorten | Make Tactical | Make Executive
Make Bolder | Add CTA | Make Softer
```

### 4.4 `prompts/score.ts`

**Inputs:** `draft, brief, sources, audience`.

**Output schema:**
```ts
z.object({
  total: z.number().int().min(0).max(100),
  scores: z.object({
    originality: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    sourceStrength: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    executiveRelevance: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    clarity: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
    readability: z.object({ value: z.number().min(0).max(20), reason: z.string() }),
  }),
  recommendations: z.array(z.string()).max(3),
  status: z.enum(['ready', 'ready_with_refinements', 'needs_work']),
})
```

### 4.5 `prompts/keywordsSuggest.ts`

Tiny GPT-4.1-mini call. Returns `z.object({ keywords: z.array(z.string()).max(6) })`.

---

## 5. Workflows

### 5.1 Generate Research Brief (server action + Inngest)

```
client click → POST /api/issues/[id]/brief
  → server creates job: 'brief.generate'
  → Inngest worker:
      1. Resolve enabled sources → adapters[] (web, news, pdfs, blogs)
      2. For each source adapter:
           - Tavily search(query = composeQuery(topic, companies, keywords))
           - Filter by domain credibility (§7)
           - Top-K (K=10) URLs
      3. Firecrawl.scrape each URL → { id, title, domain, markdown, publishedAt }
      4. Persist sources rows; assign sourceIds
      5. Call Claude with prompts/brief.ts
      6. Validate JSON; on parse fail, retry once with `response_format: 'json'`
      7. Persist brief row; emit SSE event 'brief.complete'
  → client React Query invalidates ['issue', id]
```

**Streaming UX:** While the job runs, the UI shows the brief card in skeleton state with a thin progress bar. Each phase posts an SSE update (`fetching sources`, `scoring credibility`, `synthesizing thesis`, `done`). The button shows the spinner the mockup already has.

### 5.2 Generate Newsletter Draft

Same pattern, single Claude call with `stream: true`. Stream tokens directly into the four block textareas using a delimiter convention (`<<<HOOK>>> ... <<<BODY>>> ...`). On completion, run §5.4 scoring automatically.

### 5.3 Refine section

Synchronous, no queue. Sub-second latency target. Uses GPT-4.1-mini for `Shorten`/`Make Sharper`/`Simplify`; uses Claude for `Expand`/`Add Source`/`Add Examples` (longer-form quality matters).

### 5.4 Score issue

Runs after draft generation and after every refine (debounced 2s, last-write-wins). Updates `score` and `subscores` columns; client re-renders the ring.

### 5.5 Refresh company news (cron)

Inngest scheduled fn, every 6h:
```
for each company in user.watchlist:
  Tavily.searchNews(`${company} ${user.activeKeywords.join(' OR ')}`, days=2)
  upsert into company_news (deduped by url)
```
Surfaces in a future v2 "Company news" panel; for v1, results are merged into the source pool when generating a brief if the user has companies on their watchlist.

---

## 6. Database schema (Supabase / Postgres)

```sql
create table users (
  id uuid primary key references auth.users,
  email text unique,
  workspace_name text,
  brand_voice jsonb,         -- { tone, examples[], do[], dont[] }
  created_at timestamptz default now()
);

create type issue_status as enum ('draft','review','published','archived');

create table newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text,
  subtitle text,
  topic text,
  newsletter_type text,
  audience text,
  tone text,
  length text,
  sources_enabled text[] default '{web,news,pdfs,blogs}',
  companies text[] default '{}',
  keywords text[] default '{}',
  selected_subject_idx int default 0,
  score int,                 -- denormalized total
  subscores jsonb,
  status issue_status default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table research_briefs (
  issue_id uuid primary key references newsletter_issues(id) on delete cascade,
  main_thesis text,
  key_findings text[],
  suggested_angle text,
  contradictions text[],
  llm_model text,
  generated_at timestamptz default now()
);

create table research_sources (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references newsletter_issues(id) on delete cascade,
  title text,
  publisher text,
  domain text,
  url text,
  source_type text,          -- web|news|pdf|company_blog|internal_note
  credibility_score numeric,
  published_at timestamptz,
  raw_excerpt text,
  created_at timestamptz default now()
);

create table newsletter_drafts (
  issue_id uuid primary key references newsletter_issues(id) on delete cascade,
  hook text, body text, takeaways text, cta text,
  subject_lines text[],
  preview_texts text[],
  llm_model text,
  generated_at timestamptz default now()
);

create table export_events (
  id bigserial primary key,
  issue_id uuid references newsletter_issues(id) on delete cascade,
  format text,
  created_at timestamptz default now()
);

create table company_news (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  company text,
  title text,
  url text unique,
  domain text,
  published_at timestamptz,
  fetched_at timestamptz default now()
);

-- RLS: every table policy is `user_id = auth.uid()`.
```

---

## 7. Source credibility scoring

Non-LLM heuristic, runs before sending to Claude. Cheap, deterministic, auditable.

```ts
function credibility(source): number {
  const tier = DOMAIN_TIERS[source.domain] ?? 0.4;       // 0..1, curated list
  const recency = decay(source.publishedAt, halflifeDays = 120);
  const lengthScore = clamp(source.markdown.length / 8000, 0, 1);
  const hasAuthor = source.author ? 0.05 : 0;
  return 0.55 * tier + 0.25 * recency + 0.15 * lengthScore + hasAuthor;
}
```

`DOMAIN_TIERS` seed list (curated):
- 1.0: gartner.com, mckinsey.com, bcg.com, hbr.org, nature.com, sec.gov
- 0.85: wsj.com, ft.com, bloomberg.com, economist.com, deloitte.com, pwc.com
- 0.70: techcrunch.com, theverge.com, axios.com, semafor.com
- 0.55: company blogs (openai.com, anthropic.com, stripe.com, etc.)
- 0.40: default

Top-6 by credibility populate the source cards in the mockup.

---

## 8. Streaming, autosave, optimistic UI

- **Autosave:** every editable field in the draft uses `onChange → debounce(600ms) → PATCH /api/issues/[id]`. Update `updated_at` and refresh the "Auto-saved Xm ago" label from the server response.
- **Optimistic refines:** when a user clicks an action chip, immediately replace the section text with `Refining…` skeleton; reconcile with server response.
- **Conflict resolution:** server returns `version` int; client passes it back on PATCH; on mismatch, client refetches and shows a toast `Updated from server`.

---

## 9. Exports

| Format | Implementation |
|---|---|
| Copy | Clipboard API on the assembled markdown string. |
| Markdown | Server-side: render template → `turndown(html)` → 200 with `Content-Disposition`. |
| HTML | Server-side: render React Email template → string → 200. |
| PDF | Server-side: `@react-pdf/renderer` template → `Buffer` → 200. |

All exports respect the same template tokens: `{{title}} {{subtitle}} {{hook}} {{body}} {{takeaways}} {{cta}} {{footer}}`.

---

## 10. Cost & rate-limit guardrails

- Per user: max 30 brief generations / 24h (configurable).
- Per request: Claude call capped at 8K output tokens; truncate brief context to 60K input tokens (drop lowest-credibility sources first).
- Helicone tagging: every LLM call carries `user_id`, `issue_id`, `phase` headers — gives per-issue cost in dashboard.
- Hard ceiling: estimate **~$0.18/issue** at v1 (≈$0.12 Claude draft + $0.03 brief + $0.02 score + $0.01 keywords).

---

## 11. Build phases

### Phase 1 — Skeleton (1 week)
- Next.js scaffold, Supabase project, auth flow, `newsletter_issues` CRUD, port the mockup component-by-component into `components/studio/*` reading from a Zustand store seeded with the mockup's mock data.
- All AI calls stubbed by deterministic fixtures so UI work proceeds in parallel.

### Phase 2 — Research pipeline (1 week)
- Tavily + Firecrawl adapters, credibility ranker, `prompts/brief.ts`, SSE streaming, source-card UI live.

### Phase 3 — Drafting + refinement (1 week)
- `prompts/draft.ts` with delimiter streaming, draft block editing, refine action chips wired, autosave.

### Phase 4 — Scoring + recents + exports (4 days)
- `prompts/score.ts`, ring + sub-bars driven by real data, recent issues query, all 4 export formats.

### Phase 5 — Watchlist + cron + polish (3 days)
- `refreshCompanyNews` cron, keyword auto-suggest, settings/templates/history modals upgraded to real data.

### Phase 6 — Hardening (3 days)
- Helicone wiring, cost dashboard, e2e Playwright tests for the 4 critical flows (generate brief, generate draft, refine, export PDF), Lighthouse pass.

---

## 12. Acceptance criteria

A reviewer should be able to, in one session:

1. Sign in with magic link.
2. Type a topic, set audience/tone/length, add 2 companies and 3 keywords.
3. Click **Generate Research Brief** → within 12s see 6 real sources from real domains, a thesis grounded in those sources, and 3–5 findings.
4. Click **Generate Newsletter Draft** → within 18s see all 4 blocks populated, with at least 2 inline references that map back to source IDs.
5. Click any action chip → within 3s see only the targeted block update.
6. Pick a different subject line → preview text swaps.
7. Click **Export → PDF** → download a clean 2–3 page PDF with title, subtitle, all 4 blocks, and a "Sources" footer.
8. Reload the page → all state restored from DB.

---

## 13. Open questions for product

- Brand voice: do we let teams paste 3 example issues to fine-tune voice, or rely only on the Tone preset for v1? (Recommend: example-based, v1.5.)
- Multi-user workspaces: out of scope for v1 — every user is solo. v2 adds `workspaces` and `workspace_members`.
- Live publishing (Substack/Beehiiv/Ghost): show as locked tiles in v1 with email-capture for waitlist; build OAuth flows in v2.
