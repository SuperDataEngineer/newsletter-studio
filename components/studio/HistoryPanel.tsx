"use client";

import { useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp, Copy, Check, Trash2 } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import type { IssueScore, ResearchBrief, ResearchSource } from "@/lib/types";

interface IssueRow {
  id: string;
  title: string | null;
  topic: string;
  industry: string | null;
  newsletter_type: string;
  audience: string;
  tone: string;
  length: string;
  companies: string[];
  keywords: string[];
  status: "draft" | "review" | "published";
  score: number | null;
  subscores: IssueScore["scores"] | null;
  created_at: string;
  updated_at: string;
}

interface LoadedContent {
  hook: string;
  body: string;
  takeaways: string;
  cta: string;
  subjectLines: string[];
  previewTexts: string[];
}

type StatusFilter = "all" | "draft" | "published";

const STATUS_COLORS: Record<string, string> = {
  draft: "var(--muted)",
  review: "var(--orange)",
  published: "var(--green)",
};

function scoreColor(score: number) {
  if (score >= 80) return "var(--green)";
  if (score >= 60) return "var(--orange)";
  return "#dc2626";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildBrief(raw: Record<string, unknown>, sources: ResearchSource[]): ResearchBrief {
  return {
    issueId: raw.issue_id as string,
    mainThesis: (raw.main_thesis as string) ?? "",
    keyFindings: (raw.key_findings as string[]) ?? [],
    suggestedAngle: (raw.suggested_angle as string) ?? "",
    contradictions: (raw.contradictions as string[]) ?? null,
    llmModel: (raw.llm_model as string) ?? "",
    generatedAt: (raw.generated_at as string) ?? "",
    sources,
  };
}

function buildScore(issue: IssueRow): IssueScore | null {
  if (!issue.score || !issue.subscores) return null;
  const total = Object.values(issue.subscores).reduce((s, v) => s + (v.value ?? 0), 0);
  const status = total >= 80 ? "ready" : total >= 60 ? "ready_with_refinements" : "needs_work";
  return { total, scores: issue.subscores, recommendations: [], status };
}

export function HistoryPanel() {
  const { resetWorkspace, loadFromHistory, cloneConfig } = useStudio();
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<Record<string, LoadedContent>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => setIssues(data.issues ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter((i) =>
    filter === "all" ? true : filter === "draft" ? i.status !== "published" : i.status === "published"
  );

  const loadFull = async (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/issues/${id}/load`);
      const data = await res.json();
      return data;
    } finally {
      setLoadingId(null);
    }
  };

  const handleResume = async (issue: IssueRow) => {
    const data = await loadFull(issue.id);
    if (!data) return;

    const sources: ResearchSource[] = (data.sources ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      issueId: issue.id,
      title: s.title as string,
      publisher: s.publisher as string,
      domain: s.domain as string,
      url: s.url as string,
      sourceType: s.source_type as ResearchSource["sourceType"],
      credibilityScore: s.credibility_score as number,
      publishedAt: s.published_at as string | null,
      rawExcerpt: s.raw_excerpt as string | null,
    }));

    loadFromHistory({
      issueId: issue.id,
      topic: issue.topic,
      industry: issue.industry ?? "Not industry-specific",
      newsletterType: issue.newsletter_type,
      audience: issue.audience,
      tone: issue.tone,
      length: issue.length,
      companies: issue.companies ?? [],
      keywords: issue.keywords ?? [],
      title: issue.title,
      subtitle: null,
      brief: data.brief ? buildBrief(data.brief, sources) : null,
      draft: data.draft ? {
        hook: data.draft.hook ?? "",
        body: data.draft.body ?? "",
        takeaways: data.draft.takeaways ?? "",
        cta: data.draft.cta ?? "",
      } : null,
      subjectLines: data.draft?.subject_lines ?? [],
      previewTexts: data.draft?.preview_texts ?? [],
      score: buildScore(issue),
    });
  };

  const handleExpand = async (issue: IssueRow) => {
    if (expandedId === issue.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(issue.id);
    if (expandedContent[issue.id]) return;

    const data = await loadFull(issue.id);
    if (data?.draft) {
      setExpandedContent((prev) => ({
        ...prev,
        [issue.id]: {
          hook: data.draft.hook ?? "",
          body: data.draft.body ?? "",
          takeaways: data.draft.takeaways ?? "",
          cta: data.draft.cta ?? "",
          subjectLines: data.draft.subject_lines ?? [],
          previewTexts: data.draft.preview_texts ?? [],
        },
      }));
    }
  };

  const handleCopy = (id: string) => {
    const content = expandedContent[id];
    if (!content) return;
    const text = [content.hook, "", content.body, "", content.takeaways, "", content.cta].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/issues/${id}`, { method: "DELETE" });
      setIssues((prev) => prev.filter((i) => i.id !== id));
      setConfirmDeleteId(null);
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  const handleClone = (issue: IssueRow) => {
    cloneConfig({
      topic: issue.topic,
      industry: issue.industry ?? "Not industry-specific",
      newsletterType: issue.newsletter_type,
      audience: issue.audience,
      tone: issue.tone,
      length: issue.length,
      companies: issue.companies ?? [],
      keywords: issue.keywords ?? [],
    });
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "var(--surface-warm)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>History</h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Your drafts and published newsletters</p>
          </div>
          <button
            onClick={resetWorkspace}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
              background: "var(--orange)", color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            + New Issue
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          {(["all", "draft", "published"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px", borderRadius: "6px 6px 0 0", fontSize: 13, fontWeight: filter === f ? 600 : 500,
                color: filter === f ? "var(--orange)" : "var(--muted)",
                background: "none", border: "none",
                borderBottom: filter === f ? "2px solid var(--orange)" : "2px solid transparent",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {f === "all" ? "All" : f === "draft" ? "Drafts" : "Published"}
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 600,
                padding: "1px 6px", borderRadius: 20,
                background: filter === f ? "var(--orange-soft)" : "var(--border)",
                color: filter === f ? "var(--orange)" : "var(--muted-2)",
              }}>
                {f === "all" ? issues.length : f === "draft" ? issues.filter(i => i.status !== "published").length : issues.filter(i => i.status === "published").length}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted-2)", fontSize: 13 }}>
            Loading…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 0",
            border: "1px dashed var(--border)", borderRadius: 12,
          }}>
            <FileText size={32} color="var(--muted-2)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
              {filter === "published" ? "No published issues yet" : filter === "draft" ? "No drafts yet" : "No issues yet"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-2)" }}>
              {filter === "published" ? "Publish a newsletter to see it here" : "Generate a research brief to start a draft"}
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((issue) => {
              const isPublished = issue.status === "published";
              const isExpanded = expandedId === issue.id;
              const content = expandedContent[issue.id];
              const isLoading = loadingId === issue.id;

              return (
                <div
                  key={issue.id}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 10, overflow: "hidden",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Card header row */}
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {issue.title ?? issue.topic}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{formatDate(issue.updated_at)}</span>
                        <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>·</span>
                        <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{issue.audience}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          background: STATUS_COLORS[issue.status] + "22",
                          color: STATUS_COLORS[issue.status],
                          textTransform: "capitalize",
                        }}>
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    {issue.score !== null && (
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(issue.score), lineHeight: 1 }}>{issue.score}</div>
                        <div style={{ fontSize: 10, color: "var(--muted-2)", marginTop: 1 }}>/100</div>
                      </div>
                    )}

                    {/* Action */}
                    {isPublished ? (
                      <button
                        onClick={() => handleExpand(issue)}
                        disabled={isLoading}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 500,
                          border: "1px solid var(--border)", background: "var(--surface-warm)",
                          color: "var(--muted)", cursor: isLoading ? "not-allowed" : "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {isLoading ? "Loading…" : isExpanded ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> View</>}
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        <button
                          onClick={() => handleResume(issue)}
                          disabled={isLoading || !!deletingId}
                          style={{
                            padding: "6px 14px", borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                            border: "none", background: isLoading ? "var(--muted-2)" : "var(--orange)",
                            color: "#fff", cursor: isLoading || !!deletingId ? "not-allowed" : "pointer",
                          }}
                        >
                          {isLoading ? "Loading…" : "Resume"}
                        </button>
                        {confirmDeleteId === issue.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(issue.id)}
                              disabled={deletingId === issue.id}
                              style={{
                                padding: "6px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                                border: "none", background: "#dc2626", color: "#fff",
                                cursor: deletingId === issue.id ? "not-allowed" : "pointer",
                              }}
                            >
                              {deletingId === issue.id ? "Deleting…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{
                                padding: "6px 10px", borderRadius: 6, fontSize: 12.5,
                                border: "1px solid var(--border)", background: "var(--surface-warm)",
                                color: "var(--muted)", cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(issue.id)}
                            disabled={isLoading || !!deletingId}
                            style={{
                              display: "flex", alignItems: "center",
                              padding: "6px 8px", borderRadius: 6,
                              border: "1px solid var(--border)", background: "var(--surface-warm)",
                              color: "var(--muted-2)", cursor: isLoading || !!deletingId ? "not-allowed" : "pointer",
                              transition: "color 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#dc2626"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded published content */}
                  {isPublished && isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "18px 20px" }}>
                      {!content && (
                        <div style={{ fontSize: 13, color: "var(--muted-2)", textAlign: "center", padding: "12px 0" }}>Loading content…</div>
                      )}
                      {content && (
                        <>
                          {[
                            { label: "Hook", text: content.hook },
                            { label: "Body", text: content.body },
                            { label: "Takeaways", text: content.takeaways },
                            { label: "CTA", text: content.cta },
                          ].map(({ label, text }) => text && (
                            <div key={label} style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                {label}
                              </div>
                              <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                                {text}
                              </div>
                            </div>
                          ))}

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                            <button
                              onClick={() => handleCopy(issue.id)}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "7px 14px", borderRadius: 6, fontSize: 12.5, fontWeight: 500,
                                border: "1px solid var(--border)", background: copiedId === issue.id ? "var(--green)" : "var(--surface-warm)",
                                color: copiedId === issue.id ? "#fff" : "var(--muted)", cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                            >
                              {copiedId === issue.id ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                            </button>
                            <button
                              onClick={() => handleClone(issue)}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "7px 14px", borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                                border: "none", background: "var(--orange)", color: "#fff", cursor: "pointer",
                              }}
                            >
                              New issue from this
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
