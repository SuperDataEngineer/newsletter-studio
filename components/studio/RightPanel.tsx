"use client";

import { useState } from "react";
import { Copy, Check, FileText, Code, FileDown, ExternalLink } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import { useScoring } from "@/hooks/useScoring";
import { ScoreRing } from "./ScoreRing";
import { ExportTile } from "./ExportTile";
import { draftToMarkdown } from "@/lib/export/markdown";
import type { DraftSection, Recommendation } from "@/lib/types";

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

const SECTION_LABELS: Record<string, string> = {
  hook: "Hook", body: "Body", takeaways: "Takeaways", cta: "CTA", general: "General",
};
const SECTION_COLORS: Record<string, string> = {
  hook: "#3b82f6", body: "#8b5cf6", takeaways: "#f97316", cta: "#10b981", general: "#6b7280",
};

export function RightPanel() {
  const { issueId, score, title, subtitle, draft, brief, subjectLines, previewTexts, selectedSubjectIdx, setDraftSection, setRefiningSection } = useStudio();
  const { scoreNow, scoreLoading } = useScoring();
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);

  const handleApply = async (rec: Recommendation, idx: number) => {
    if (!issueId || rec.section === "general") return;
    const section = rec.section as DraftSection;
    setApplyingIdx(idx);
    setRefiningSection(section);
    try {
      const res = await fetch(`/api/issues/${issueId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, currentText: draft[section], customInstruction: rec.text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setDraftSection(section, data.text);
        scoreNow();
      }
    } catch { /* silent */ } finally {
      setApplyingIdx(null);
      setRefiningSection(null);
    }
  };

  const handleCopy = () => {
    const subject = subjectLines[selectedSubjectIdx];
    const preview = previewTexts[selectedSubjectIdx];
    const lines = [
      subject ? `Subject: ${subject}` : null,
      preview ? `Preview: ${preview}` : null,
      subject || preview ? "" : null,
      title, subtitle, "",
      draft.hook, "",
      draft.body, "",
      draft.takeaways, "",
      draft.cta,
    ].filter((l) => l !== null) as string[];

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleMarkdown = () => {
    const md = draftToMarkdown({
      title,
      subtitle,
      hook: draft.hook,
      body: draft.body,
      takeaways: draft.takeaways,
      cta: draft.cta,
      sources: brief?.sources,
    });

    const slug = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") || "newsletter";
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Issue Score
          </div>
          {score && (
            <button
              onClick={scoreNow}
              disabled={scoreLoading}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                border: "1px solid var(--border)", background: "var(--surface-warm)",
                color: scoreLoading ? "var(--muted-2)" : "var(--muted)",
                fontSize: 11.5, fontWeight: 500, cursor: scoreLoading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!scoreLoading) { (e.currentTarget).style.borderColor = "var(--border-strong)"; (e.currentTarget).style.color = "var(--text)"; } }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--muted)"; }}
            >
              {scoreLoading ? "Scoring…" : "↻ Re-score"}
            </button>
          )}
        </div>
        {scoreLoading && !score && (
          <div style={{ fontSize: 13, color: "var(--muted-2)", textAlign: "center", padding: "16px 0" }}>
            Scoring…
          </div>
        )}
        {score && !scoreLoading && (
          <>
            <ScoreRing score={score} />
            <button
              onClick={() => setShowFeedback((v) => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", marginTop: 14, padding: "9px 14px", borderRadius: 20,
                border: "1px solid #FCD34D",
                background: showFeedback ? "#FEF3C7" : "#FFFBEB",
                color: "#92400E", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>💡</span>
                Actionable Feedback
              </span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{showFeedback ? "▲ Hide" : "▼ View"}</span>
            </button>
            {showFeedback && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {score.recommendations.map((r, i) => {
                  const rec = typeof r === "string" ? { text: r, section: "general" as const } : r;
                  const sectionColor = SECTION_COLORS[rec.section] ?? SECTION_COLORS.general;
                  const isApplying = applyingIdx === i;
                  const canApply = rec.section !== "general" && !!issueId;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px", borderRadius: 8,
                        background: "var(--surface-warm)", border: "1px solid var(--border)",
                        fontSize: 12.5, color: "var(--text)", lineHeight: 1.6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "var(--orange)", fontWeight: 700 }}>{i + 1}.</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: sectionColor + "22", color: sectionColor, letterSpacing: "0.04em",
                        }}>
                          {SECTION_LABELS[rec.section]}
                        </span>
                      </div>
                      <div style={{ marginBottom: canApply ? 8 : 0 }}>{rec.text}</div>
                      {canApply && (
                        <button
                          onClick={() => handleApply(rec, i)}
                          disabled={isApplying || applyingIdx !== null}
                          style={{
                            padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                            border: `1px solid ${sectionColor}`,
                            background: isApplying ? sectionColor + "22" : "transparent",
                            color: sectionColor,
                            cursor: isApplying || applyingIdx !== null ? "not-allowed" : "pointer",
                            opacity: applyingIdx !== null && !isApplying ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {isApplying ? "Applying…" : `↳ Apply to ${SECTION_LABELS[rec.section]}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {score && scoreLoading && (
          <div style={{ opacity: 0.5, pointerEvents: "none" }}>
            <ScoreRing score={score} />
          </div>
        )}
        {!score && !scoreLoading && (
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
          <ExportTile label={copied ? "Copied!" : "Copy"} Icon={copied ? Check : Copy} accent onClick={handleCopy} />
          <ExportTile label="Markdown" Icon={FileText} onClick={handleMarkdown} />
          <ExportTile label="HTML" Icon={Code} onClick={() => {}} />
          <ExportTile label="PDF" Icon={FileDown} onClick={() => {}} />
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
