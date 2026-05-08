# Newsletter Studio — Claude Code Briefing

## What This Is

AI Research & Newsletter Studio. A 3-column web app that takes a topic + config, runs live web research, synthesizes a research brief, and generates a structured newsletter draft with scoring and export.

## Current Status

**Phase 3 in progress.** Full AI pipeline wired (brief → draft → refine → score). Supabase running as demo DB. UI polished: DraftBlock redesigned, ScoreRing correct, state persists across refreshes. Next: HTML/PDF export, Recent Issues from real DB, autosave.

---

## Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Done |
| UI | Tailwind CSS + custom design system | Done |
| State | Zustand (workspace) + React Query (server) | Done — persist middleware added, survives refresh |
| Forms | react-hook-form + zod | Schemas written, not yet wired |
| Auth | AWS Cognito | **Deferred — wireframe exists, wire later** |
| Database | AWS Aurora Serverless v2 (Postgres) | **Not yet created** (Supabase demo running) |
| Storage | AWS S3 | **Not yet created** |
| LLM | Anthropic Claude (`@anthropic-ai/sdk`) | Live — `claude-sonnet-4-6` for brief structuring |
| LLM fast | Claude Haiku (`claude-haiku-4-5-20251001`) | Live — draft, refine, score (separate quota, no contention) |
| Search | Perplexity `sonar-pro` (demo) → Tavily + Exa (prod) | Perplexity live, Tavily/Exa adapters written |
| Crawling | Firecrawl | Adapter written, not yet called |
| Job queue | AWS SQS | **Not yet created** |
| Job workers | AWS Lambda | **Not yet created** |
| Cron | AWS EventBridge Scheduler | **Not yet created** |
| PDF export | @react-pdf/renderer | Stub only |
| Deploy | AWS Amplify (auto-deploy on push to main) | amplify.yml in place |

---

## Infrastructure Decisions

### Why AWS-native (not Supabase + Inngest)
Company policy: team handover requires everything in one cloud. Using Supabase + Inngest (a third-party job queue service) would introduce external dependencies the team can't manage in AWS Console.

### Database: Aurora Serverless v2 (Postgres)
Chosen over RDS t4g because it scales to zero when idle — cost-efficient for a new internal tool with unpredictable load. Postgres-compatible so the existing schema works unchanged.

### Auth: Cognito — deferred
The wireframe and stub code exist in `lib/db/client.ts`. Wire up when needed. All API routes currently skip auth checks.

### ORM: Drizzle
Drizzle is TypeScript-native, lightweight, and generates migrations via `drizzle-kit`. Preferred over Prisma for this stack because of lighter runtime and better Aurora Serverless compatibility.

### Job queue: SQS + Lambda
Replaces Inngest. Brief generation and draft generation are enqueued to SQS; Lambda workers process them. EventBridge Scheduler handles the 6-hour company news cron.

### AI: Anthropic Claude — Sonnet for research, Haiku for fast tasks
`claude-sonnet-4-6` structures the Perplexity research output into the BriefSchema. `claude-haiku-4-5-20251001` (`MODEL_FAST`) handles draft generation, section refinement, and scoring — it has a separate TPM quota so Sonnet rate limits don't block fast actions. GPT-4.1-mini (originally planned for scoring) is currently unused; Haiku is cheaper and already available.

**Score arithmetic rule:** Never trust the LLM's reported `total` field. Recalculate from subscores in two places: (1) API route before persisting to Supabase, (2) `ScoreRing` at render time. This prevents stale/wrong values from showing even if localStorage has old data.

### Research: Perplexity Sonar + Claude Haiku (demo) → Tavily + Firecrawl (production)

**Decision:** Two-step pipeline — Perplexity Sonar Pro does the web research and returns citations; Claude Haiku structures the output into our JSON schema.

**Step 1:** `lib/research/perplexity.ts` → Perplexity `sonar-pro` model, OpenAI-compatible API
**Step 2:** `lib/ai/prompts/brief.ts` `buildBriefStructurePrompt` → Claude Haiku structures into BriefSchema

**Pros:**
- Much cheaper than Claude Sonnet web_search (~$1/1M tokens vs $3/1M)
- Higher rate limits — Perplexity and Haiku have separate quotas, no contention
- Better search quality than Brave Search — Perplexity's index is purpose-built for recency
- Citations returned automatically as a `citations[]` array — no parsing needed
- Uses existing `openai` package (Perplexity is OpenAI-compatible)

**Cons:**
- Two API keys needed (ANTHROPIC + PPLX)
- Still no full-page crawling — Perplexity returns snippets, not full article text
- Credibility ranker (`lib/research/rank.ts`) still bypassed
- Lower quality than Tavily + Firecrawl (no full content, less control over source selection)

**Migration path:** Replace `researchWithPerplexity()` call in `generateBrief.ts` with Tavily search + Firecrawl crawl + credibility rank. The Haiku structuring step and everything downstream stays unchanged.

---

## Demo → Production: What Replaces What

When moving from the Supabase demo to the full AWS-native stack, here is the exact swap map:

| Demo (now) | Production (AWS) | Migration effort |
|---|---|---|
| **Supabase Postgres** | **Aurora Serverless v2** (Postgres 15) | Low — same schema, swap connection string, replace Supabase client with Drizzle + `pg` |
| **Supabase anon/service role keys** | **IAM auth** via `aws-sdk` + `rds-signer` | Medium — add IAM role to Lambda + Next.js task, remove Supabase client |
| **Next.js API route handles brief/draft inline** | **SQS + Lambda workers** (`newsletter-brief-worker`, `newsletter-draft-worker`) | High — extract logic from API routes into Lambda handlers, add SQS enqueue/poll |
| **No background jobs** | **EventBridge Scheduler** every 6h | Low — wire `companies/news` cron trigger |
| **No file storage** | **S3** (`newsletter-studio-exports`) | Low — swap `fs` write with `s3.putObject` in export routes |
| **No auth** | **AWS Cognito** | Medium — add Cognito User Pool, wire JWT to API routes, add RLS policies |
| **Claude web_search (Brave)** | **Tavily + Firecrawl + credibility ranker** | Medium — replace search step in `generateBrief.ts`, adapters already written |
| **No observability** | **Helicone** (LLM cost tracking) | Low — add `Helicone-Auth` header to all Claude/OpenAI calls |
| **AWS Amplify deploy** | **AWS Amplify deploy** (unchanged) | None |

---

## AWS Services to Create

| Service | Name / Config | Credentials needed |
|---|---|---|
| Aurora Serverless v2 | Postgres 15, serverless v2 | Host, Port, DB name, Username, Password |
| S3 | `newsletter-studio-exports` | Bucket name + region |
| SQS | `newsletter-brief-queue` (standard) | Queue URL |
| SQS | `newsletter-draft-queue` (standard) | Queue URL |
| Lambda | `newsletter-brief-worker` | Region only (code deployed from repo) |
| Lambda | `newsletter-draft-worker` | Region only |
| EventBridge Scheduler | `newsletter-company-news-cron` every 6h | Region only |
| IAM User | `newsletter-studio-app` with SQS + S3 + Lambda invoke permissions | Access Key ID + Secret Access Key |

---

## Environment Variables

See `.env.example` for the full list. Key vars:

```
# Database (Aurora Serverless v2)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=newsletter-studio-exports
SQS_BRIEF_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SQS_DRAFT_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Research
TAVILY_API_KEY=tvly-...
EXA_API_KEY=
FIRECRAWL_API_KEY=fc-...

# Observability
HELICONE_API_KEY=
```

---

## Repo Structure

```
app/
  (workspace)/          # Main studio UI (3-column layout)
  api/
    issues/             # CRUD for newsletter issues
    issues/[id]/
      brief/            # POST → enqueue brief generation job
      draft/            # POST → enqueue draft generation job
      refine/           # POST → synchronous section refinement
      score/            # POST → synchronous quality scoring
      export/[fmt]/     # GET → pdf | md | html | copy
    sources/search/     # POST → Tavily/Exa wrapper
    companies/news/     # POST → watchlist news fetch

components/studio/      # All UI components (ported from mockup)
  StudioShell.tsx       # Root layout — hydration-gated (no flash on refresh)
  Topbar.tsx
  LeftPanel.tsx         # Issue config, topic, tags, sources
  CenterPanel.tsx       # Research brief + newsletter draft
  RightPanel.tsx        # Score ring, exports, recent issues
  DraftBlock.tsx        # Stacked: header + textarea + color-coded action pills
  ScoreRing.tsx         # SVG ring + subscore bars — total derived from subscores
  SourceCard.tsx        # Source card — deterministic per-domain color from 15-color palette
  TagInputSection.tsx   # Pill tag input with company/keyword variants
  ExportTile.tsx        # Vertical export tile
  CustomEditModal.tsx   # Custom instruction modal with section-specific example prompts
  SectionExpandModal.tsx # Full-screen (92vw × 90vh) section reading/editing modal

lib/
  ai/
    claude.ts           # Anthropic client
    openai.ts           # OpenAI client
    schemas.ts          # Zod schemas for all AI outputs
    prompts/            # Prompt builders (brief, draft, refine, score, keywords)
  research/
    tavily.ts           # Search adapter
    exa.ts              # Semantic search fallback
    firecrawl.ts        # Page-to-markdown crawler
    rank.ts             # Credibility scorer (deterministic, no LLM)
  db/
    client.ts           # DB client (currently Supabase stub — replace with Drizzle + Aurora)
    queries/            # TODO: Drizzle query functions
    schema.ts           # TODO: Drizzle schema (mirrors SQL in IMPLEMENTATION_PLAN.md §6)
  workflows/
    generateBrief.ts    # Live — Perplexity → Claude Haiku → Supabase
    generateDraft.ts    # Live — Claude Haiku, word-target aware, persists to Supabase
    inngestClient.ts    # DELETE — leftover from original plan, replaced by SQS
  export/
    markdown.ts         # Draft → .md (implemented)
    pdf.tsx             # TODO: @react-pdf/renderer
    html.ts             # TODO: React Email template

store/
  useStudio.ts          # Zustand store — persist middleware (localStorage), partialize excludes loading flags

hooks/
  useHydration.ts       # Gates render until Zustand localStorage rehydration completes
  useScoring.ts         # Calls /score API, updates store, exposes scoreNow + scoreLoading
```

---

## What Is Stubbed vs Real

| Thing | Status |
|---|---|
| UI shell, all components | **Real — DraftBlock redesigned, ScoreRing corrected, modals added** |
| Zustand store | **Real — persist middleware, survives refresh, no flash** |
| Brief API + workflow | **Real — Perplexity sonar-pro → Claude Haiku → Supabase** |
| Draft API + workflow | **Real — Claude Haiku, word-target, title/subtitle persisted** |
| Refine API | **Real — 14 actions + custom instruction, Claude Haiku** |
| Score API | **Real — Claude Haiku, total recalculated server-side** |
| Zod schemas | **Real — validated shapes for all AI outputs** |
| Prompt builders | **Real — production-quality prompts written** |
| Perplexity research | **Real — sonar-pro, needs PPLX_API_KEY** |
| Tavily / Exa / Firecrawl adapters | **Real — adapters written, keys not yet wired** |
| Credibility ranker | **Real — deterministic, no dependencies** |
| Anthropic client | **Real — live, ANTHROPIC_API_KEY set** |
| OpenAI client | **Real — available, currently unused (Haiku handles fast tasks)** |
| DB client | **Supabase demo — replace with Drizzle + Aurora** |
| SQS queue client | **Not written yet** |
| Lambda workers | **Not written yet** |
| Drizzle schema + migrations | **Not written yet** |
| Auth (Cognito) | **Deferred — wireframe only** |
| PDF export | **Stub** |
| Markdown export | **Real — client-side download** |
| HTML export | **Stub** |
| Copy export | **Real — includes subject line + preview text** |
| Recent Issues | **Mock data — replace with real DB query** |

---

## Build Phases

### Phase 1 — Skeleton ✅ DONE
Next.js scaffold, full UI ported from mockup, Zustand store, all API routes stubbed, design fixes applied.

### Phase 2 — AI Pipeline ✅ DONE
- Perplexity sonar-pro + Claude Haiku two-step research pipeline
- Draft generation (Haiku, word-target aware, title/subtitle persisted)
- Section refinement — 14 actions + custom instruction modal
- Score API — Haiku, subscores recalculated server-side
- Zustand persist middleware — state survives refresh, no hydration flash
- UI: DraftBlock redesigned (color-coded pills, Expand modal, Custom Edit modal)
- UI: ScoreRing corrected (total derived from subscores, never from LLM output)
- UI: SourceCard per-domain color coding, actionable feedback collapsible toggle

### Phase 3 — Exports + Persistence (current)
- [ ] Autosave: debounced PATCH on every keystroke
- [ ] Recent Issues from real Supabase query (replace mock data in RightPanel)
- [ ] HTML export (`lib/export/html.ts`)
- [ ] PDF export (`@react-pdf/renderer`)

### Phase 4 — Database + Queue Infrastructure
- Replace `lib/db/client.ts` with Drizzle + Aurora Serverless v2
- Write Drizzle schema mirroring `IMPLEMENTATION_PLAN.md §6`
- Run first migration
- Write SQS client in `lib/queue/sqs.ts`
- Delete `lib/workflows/inngestClient.ts` (leftover Inngest reference)

### Phase 5 — Production Research Pipeline
- Replace `researchWithPerplexity()` with Tavily search + Firecrawl crawl + credibility rank
- SSE stream: progress events back to client (`fetching sources` → `scoring` → `synthesizing` → `done`)
- Haiku structuring step and everything downstream stays unchanged

### Phase 6 — Watchlist + Cron
- EventBridge Scheduler triggers company news refresh Lambda every 6h
- Keyword auto-suggest wired to Haiku

### Phase 6 — Watchlist + Cron
- EventBridge Scheduler triggers company news refresh Lambda every 6h
- Keyword auto-suggest wired to GPT-4.1-mini

### Phase 7 — Auth + Hardening
- Wire Cognito
- Helicone for LLM cost tracking
- Playwright e2e tests for 4 critical flows
- Lighthouse pass

---

## Key Rules

- All AI output goes through zod validation (`lib/ai/schemas.ts`) before being stored or rendered
- Every LLM call must carry `user_id`, `issue_id`, `phase` headers for Helicone cost tracking
- Claude caps at 8K output tokens; truncate brief context to 60K input (drop lowest-credibility sources first)
- Autosave is debounced 600ms PATCH — never block the user
- The mockup files (`studio.jsx`, `studio.css`, `AI Research & Newsletter Studio.html`) stay in the repo as the visual reference contract
- Never break the 3-column layout — it is the core UX
- **Score total must always be derived from subscores** — never render or persist `score.total` from the LLM. Recalculate in the API route before Supabase write, and again in `ScoreRing` at render time
- **Hydration gate** — any component that reads Zustand state on first render must be gated behind `useHydration()` to prevent a flash of mock default data before localStorage rehydrates
