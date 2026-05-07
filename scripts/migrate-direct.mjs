import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: process.env.RDS_HOST,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.RDS_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  statement_timeout: 30000,
});

const sql = `
CREATE TYPE IF NOT EXISTS issue_status AS ENUM ('draft','review','published','archived');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  workspace_name TEXT,
  brand_voice JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  subtitle TEXT,
  topic TEXT,
  newsletter_type TEXT,
  audience TEXT,
  tone TEXT,
  length TEXT,
  sources_enabled TEXT[] DEFAULT '{web,news,pdfs,blogs}',
  companies TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  selected_subject_idx INT DEFAULT 0,
  score INT,
  subscores JSONB,
  status issue_status DEFAULT 'draft',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_briefs (
  issue_id UUID PRIMARY KEY REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  main_thesis TEXT,
  key_findings TEXT[],
  suggested_angle TEXT,
  contradictions TEXT[],
  llm_model TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  title TEXT,
  publisher TEXT,
  domain TEXT,
  url TEXT,
  source_type TEXT,
  credibility_score NUMERIC,
  published_at TIMESTAMPTZ,
  raw_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_drafts (
  issue_id UUID PRIMARY KEY REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  hook TEXT,
  body TEXT,
  takeaways TEXT,
  cta TEXT,
  subject_lines TEXT[],
  preview_texts TEXT[],
  llm_model TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS export_events (
  id BIGSERIAL PRIMARY KEY,
  issue_id UUID REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_news (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company TEXT,
  title TEXT,
  url TEXT UNIQUE,
  domain TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now()
);
`;

async function run() {
  console.log("Connecting to Aurora...");
  await client.connect();
  console.log("Connected. Running migration...");

  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    process.stdout.write(`  ${statement.split("\n")[0].slice(0, 60)}... `);
    await client.query(statement);
    console.log("✓");
  }

  console.log("\nMigration complete — all tables created.");
  await client.end();
}

run().catch(e => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
