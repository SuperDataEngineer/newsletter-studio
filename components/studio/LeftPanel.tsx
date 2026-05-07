"use client";

import { Globe, Newspaper, FileText, BookOpen, Lock, Sparkles } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import { TagInputSection } from "./TagInputSection";

const NEWSLETTER_TYPES = [
  "Insight / Analysis", "Weekly Digest", "Deep Dive", "Market Brief",
  "Competitive Intelligence", "Founder Note", "Executive Brief",
  "Trend Report", "Curated Roundup", "Thought Leadership Essay",
];
const AUDIENCES = [
  "Enterprise Leaders", "Marketing Executives", "Founders", "Product Leaders",
  "AI Teams", "Data & Analytics Leaders", "Consultants", "Agency Strategists",
  "Investors", "General Business Readers",
];
const TONES = [
  "Boardroom-ready, analytical", "Sharp and opinionated", "Educational and practical",
  "Premium newsletter", "Founder-style, conversational", "Consulting-style, structured",
  "Data-driven and objective", "Bold and provocative", "Calm and authoritative",
  "Simple and accessible",
];
const LENGTHS = [
  "Short · 400–600 words", "Medium · 800–1,000 words", "Long · 1,500+ words",
  "Executive summary · 300–500 words", "Deep report · 2,000+ words",
];

const ACTIVE_SOURCES = [
  { id: "web", label: "Web Search", Icon: Globe },
  { id: "news", label: "News", Icon: Newspaper },
  { id: "pdfs", label: "PDFs", Icon: FileText },
  { id: "blogs", label: "Company Blogs", Icon: BookOpen },
];
const LOCKED_SOURCES = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X / Twitter" },
  { id: "podcasts", label: "Podcasts" },
  { id: "youtube", label: "YouTube" },
];

function Dropdown({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 6,
          border: "1px solid var(--border)", background: "var(--surface)",
          color: "var(--text)", fontSize: 13.5, appearance: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function LeftPanel() {
  const {
    topic, setTopic,
    newsletterType, setNewsletterType,
    audience, setAudience,
    tone, setTone,
    length, setLength,
    activeSources, toggleSource,
    companies, addCompany, removeCompany,
    keywords, addKeyword, removeKeyword,
    briefLoading, setBriefLoading,
  } = useStudio();

  const handleGenerateBrief = () => {
    setBriefLoading(true);
    // TODO: call POST /api/issues/[id]/brief
    setTimeout(() => setBriefLoading(false), 1200);
  };

  return (
    <aside
      style={{
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        background: "var(--surface-warm)",
      }}
    >
      {/* Topic */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
          Topic
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={4}
          placeholder="Describe the topic for your newsletter…"
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--surface)",
            resize: "vertical", lineHeight: 1.55, fontSize: 13.5,
          }}
        />
      </div>

      <Dropdown label="Newsletter Type" value={newsletterType} options={NEWSLETTER_TYPES} onChange={setNewsletterType} />
      <Dropdown label="Audience" value={audience} options={AUDIENCES} onChange={setAudience} />
      <Dropdown label="Tone" value={tone} options={TONES} onChange={setTone} />
      <Dropdown label="Length" value={length} options={LENGTHS} onChange={setLength} />

      {/* Company watchlist */}
      <TagInputSection
        label="Company News"
        placeholder="Add company…"
        tags={companies}
        variant="company"
        onAdd={addCompany}
        onRemove={removeCompany}
      />

      {/* Keywords */}
      <TagInputSection
        label="Keywords"
        placeholder="Add keyword…"
        tags={keywords}
        variant="keyword"
        onAdd={addKeyword}
        onRemove={removeKeyword}
      />

      {/* Research sources */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
          Research Sources
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ACTIVE_SOURCES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => toggleSource(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 500,
                border: `1px solid ${activeSources[id] ? "var(--orange)" : "var(--border)"}`,
                background: activeSources[id] ? "var(--orange-soft)" : "var(--surface)",
                color: activeSources[id] ? "var(--orange)" : "var(--muted)",
                cursor: "pointer",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
          {LOCKED_SOURCES.map(({ id, label }) => (
            <button
              key={id}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 500,
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--muted-2)", cursor: "not-allowed", opacity: 0.7,
              }}
            >
              <Lock size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button — immediately after Research Sources */}
      <button
        onClick={handleGenerateBrief}
        disabled={briefLoading}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "11px 0", borderRadius: 8, width: "100%",
          background: briefLoading ? "var(--muted-2)" : "var(--orange)",
          color: "#fff", fontWeight: 600, fontSize: 13.5,
          border: "none", cursor: briefLoading ? "not-allowed" : "pointer",
          transition: "background 0.15s",
          marginBottom: 0,
        }}
      >
        <Sparkles size={15} />
        {briefLoading ? "Researching…" : "Generate Research Brief"}
      </button>
    </aside>
  );
}
