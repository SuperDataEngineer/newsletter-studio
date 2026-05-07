"use client";

import { Copy, FileText, Code, FileDown, ExternalLink } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import { ScoreRing } from "./ScoreRing";
import { ExportTile } from "./ExportTile";

const RECENT_ISSUES = [
  { id: "1", title: "AI Search Visibility: The Enterprise Playbook", date: "May 12, 2025", words: "920 words", status: "Published" as const },
  { id: "2", title: "State of Generative Search in 2026", date: "May 6, 2025", words: "1,135 words", status: "Draft" as const },
  { id: "3", title: "B2B Content Strategy for AI Discovery", date: "Apr 28, 2025", words: "865 words", status: "Review" as const },
];

const STATUS_COLORS: Record<string, string> = {
  Published: "var(--green)",
  Draft: "var(--muted)",
  Review: "var(--orange)",
};

export function RightPanel() {
  const { score, title, subtitle, draft } = useStudio();

  const handleCopy = () => {
    const text = [title, subtitle, "", draft.hook, "", draft.body, "", draft.takeaways, "", draft.cta].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <aside
      style={{
        overflowY: "auto",
        padding: 22,
        background: "var(--surface-warm)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Score card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Issue Score
        </div>
        {score ? (
          <ScoreRing score={score} />
        ) : (
          <div style={{ fontSize: 13, color: "var(--muted-2)", textAlign: "center", padding: "16px 0" }}>
            Generate a draft to see scoring
          </div>
        )}
      </div>

      {/* Export card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Export
        </div>

        {/* Row 1: 4 active tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          <ExportTile label="Copy" Icon={Copy} accent onClick={handleCopy} />
          <ExportTile label="Markdown" Icon={FileText} onClick={() => { /* TODO */ }} />
          <ExportTile label="HTML" Icon={Code} onClick={() => { /* TODO */ }} />
          <ExportTile label="PDF" Icon={FileDown} onClick={() => { /* TODO */ }} />
        </div>

        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500, marginBottom: 8 }}>
          Coming soon
        </div>

        {/* Row 2: 3 locked tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <ExportTile label="Substack" Icon={ExternalLink} locked onClick={() => {}} />
          <ExportTile label="Beehiiv" Icon={ExternalLink} locked onClick={() => {}} />
          <ExportTile label="Ghost" Icon={ExternalLink} locked onClick={() => {}} />
        </div>
      </div>

      {/* Recent Issues card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recent Issues
        </div>
        {RECENT_ISSUES.map((issue) => (
          <div
            key={issue.id}
            style={{
              padding: "10px 12px", borderRadius: 8, marginBottom: 6,
              border: "1px solid var(--border)", background: "var(--surface-warm)",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.35 }}>
              {issue.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{issue.date}</span>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{issue.words}</span>
              <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 600, color: STATUS_COLORS[issue.status] }}>
                {issue.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
