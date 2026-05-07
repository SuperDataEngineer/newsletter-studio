# Newsletter Studio — Claude Code Briefing

## What This Is

AI Research & Newsletter Studio. A 3-column web app that takes a topic + config, runs live web research, synthesizes a research brief, and generates a structured newsletter draft with scoring and export.

## Current Status

**Phase 1 complete.** Full UI shell built with mock data. All API routes stubbed. No real AI calls yet.

---

## Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Done |
| UI | Tailwind CSS + custom design system | Done |
| State | Zustand (workspace) + React Query (server) | Done — store seeded with mock data |
| Forms | react-hook-form + zod | Schemas written, not yet wired |
| Auth | AWS Cognito | **Deferred — wireframe exists, wire later** |
| Database | AWS Aurora Serverless v2 (Postgres) | **Not yet created** |
| Storage | AWS S3 | **Not yet created** |
| LLM | Anthropic Claude (`@anthropic-ai/sdk`) | Client written, not yet called |
| LLM fast | OpenAI GPT-4.1-mini (`openai`) | Client written, not yet called |
| Search | Tavily (primary) + Exa (semantic fallback) | Adapters written, not yet called |
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

### AI: Anthropic Claude API only
Using `claude-sonnet-4-6` for all drafting and research synthesis. GPT-4.1-mini kept for fast structured JSON tasks (scoring, keyword suggestions) because it's cheaper for high-frequency calls.

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
  StudioShell.tsx       # Root layout
  Topbar.tsx
  LeftPanel.tsx         # Issue config, topic, tags, sources
  CenterPanel.tsx       # Research brief + newsletter draft
  RightPanel.tsx        # Score ring, exports, recent issues
  DraftBlock.tsx        # 3-col grid: label | textarea | action chips
  ScoreRing.tsx         # SVG ring + subscore bars
  SourceCard.tsx        # Source card (3-col grid in center panel)
  TagInputSection.tsx   # Pill tag input with company/keyword variants
  ExportTile.tsx        # Vertical export tile

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
    generateBrief.ts    # TODO: SQS message handler
    generateDraft.ts    # TODO: SQS message handler
    inngestClient.ts    # DELETE — leftover from original plan, replaced by SQS
  export/
    markdown.ts         # Draft → .md (implemented)
    pdf.tsx             # TODO: @react-pdf/renderer
    html.ts             # TODO: React Email template

store/
  useStudio.ts          # Zustand store — seeded with mock data from original mockup
```

---

## What Is Stubbed vs Real

| Thing | Status |
|---|---|
| UI shell, all components | **Real — renders from mock data** |
| Zustand store | **Real — full state shape, mock fixtures** |
| All API routes | **Stub — return fixtures or empty arrays** |
| Zod schemas | **Real — validated shapes for all AI outputs** |
| Prompt builders | **Real — production-quality prompts written** |
| Tavily / Exa / Firecrawl adapters | **Real — just need API keys** |
| Credibility ranker | **Real — deterministic, no dependencies** |
| Anthropic client | **Real — needs ANTHROPIC_API_KEY** |
| OpenAI client | **Real — needs OPENAI_API_KEY** |
| DB client | **Stub — Supabase placeholder, replace with Drizzle** |
| SQS queue client | **Not written yet** |
| Lambda workers | **Not written yet** |
| Drizzle schema + migrations | **Not written yet** |
| Auth (Cognito) | **Deferred — wireframe only** |
| PDF export | **Stub** |
| Markdown export | **Real** |
| HTML export | **Stub** |

---

## Build Phases

### Phase 1 — Skeleton ✅ DONE
Next.js scaffold, full UI ported from mockup, Zustand store, all API routes stubbed, design fixes applied.

### Phase 2 — Database + Queue Infrastructure (next)
- Replace `lib/db/client.ts` with Drizzle + Aurora Serverless v2
- Write Drizzle schema mirroring `IMPLEMENTATION_PLAN.md §6`
- Run first migration
- Write SQS client in `lib/queue/sqs.ts`
- Delete `lib/workflows/inngestClient.ts` (leftover Inngest reference)

### Phase 3 — Research Pipeline
- Wire `POST /api/issues/[id]/brief` → enqueue to SQS
- Lambda worker: Tavily → Firecrawl → credibility rank → Claude → store brief
- SSE stream: progress events back to client (`fetching sources` → `scoring` → `synthesizing` → `done`)
- Source cards render from real data

### Phase 4 — Drafting + Refinement
- Wire `POST /api/issues/[id]/draft` → Claude stream with `<<<HOOK>>>` delimiter convention
- Draft blocks populate from stream tokens
- Action chips wire to `/api/issues/[id]/refine` (synchronous, GPT-4.1-mini for short actions)
- Autosave: debounced PATCH on every keystroke

### Phase 5 — Scoring + Exports
- Score ring driven by real GPT-4.1-mini JSON
- PDF export via `@react-pdf/renderer`
- Recent issues from real DB query

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
