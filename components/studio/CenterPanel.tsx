"use client";

import { Sparkles, Check, BookOpen, List, Lightbulb } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import { useScoring } from "@/hooks/useScoring";
import { SourceCard } from "./SourceCard";
import { DraftBlock } from "./DraftBlock";

export function CenterPanel() {
  const {
    issueId,
    brief, briefLoading,
    title, setTitle,
    subtitle, setSubtitle,
    subjectLines, previewTexts,
    selectedSubjectIdx, setSelectedSubjectIdx,
    draftLoading, setDraftLoading,
    setDraftSection, setSubjectLines, setPreviewTexts,
    newsletterType, audience, tone, length,
    savedAt,
  } = useStudio();

  const { scoreNow } = useScoring();

  const handleGenerateDraft = async () => {
    if (!brief || !issueId) return;
    setDraftLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, newsletterType, audience, tone, length }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Draft generation failed");
      }

      const { draft, title: newTitle, subtitle: newSubtitle } = await res.json();
      setDraftSection("hook", draft.hook);
      setDraftSection("body", draft.body);
      setDraftSection("takeaways", draft.takeaways);
      setDraftSection("cta", draft.cta);
      setSubjectLines(draft.subjectLines);
      setPreviewTexts(draft.previewTexts);
      if (newTitle) setTitle(newTitle);
      if (newSubtitle) setSubtitle(newSubtitle);
      // Score in background — don't await, don't block the UI
      scoreNow();
    } catch (err) {
      console.error("[draft]", err);
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <main style={{ overflowY: "auto", padding: "10px 10px", borderRight: "1px solid var(--border)" }}>

      {/* ── Research Brief ──────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 18 }}>
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
              1
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", letterSpacing: "-0.01em" }}>Research Brief</span>
          </div>
          {brief && (
            <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface-warm)", border: "1px solid var(--border)", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{brief.sources.length}</span> sources
            </span>
          )}
        </div>

        {briefLoading && (
          <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Fetching sources and synthesizing brief…
          </div>
        )}

        {brief && !briefLoading && (
          <>
            {/* Brief rows — 2-column grid: 180px label | 1fr content */}
            <div style={{ borderBottom: "1px solid var(--border)" }}>
              {/* Main Thesis */}
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "16px 22px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                  <BookOpen size={16} color="var(--orange)" />
                  Main Thesis
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text)", margin: 0 }}>{brief.mainThesis}</p>
              </div>

              {/* Key Findings */}
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "16px 22px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                  <List size={16} color="var(--muted)" />
                  Key Findings
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 13.5, lineHeight: 1.65 }}>
                  {brief.keyFindings.map((f, i) => (
                    <li key={i} style={{ marginBottom: 4, display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0 }}>·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Angle */}
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "16px 22px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                  <Lightbulb size={16} color="#3b6fa0" />
                  Suggested Angle
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text)", margin: 0 }}>{brief.suggestedAngle}</p>
              </div>
            </div>

            {/* Source cards — 3-column horizontal grid */}
            <div style={{ padding: "16px 22px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Top Sources
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                {brief.sources.slice(0, 6).map((s) => <SourceCard key={s.id} source={s} />)}
              </div>
            </div>
          </>
        )}

        {/* Generate Draft button */}
        <div style={{ padding: "0 22px 22px" }}>
          <button
            onClick={handleGenerateDraft}
            disabled={!brief || draftLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: 14, borderRadius: 8, width: "100%",
              background: !brief || draftLoading ? "var(--border)" : "var(--text)",
              color: !brief || draftLoading ? "var(--muted)" : "#fff",
              fontWeight: 600, fontSize: 14, border: "none",
              cursor: !brief || draftLoading ? "not-allowed" : "pointer",
            }}
          >
            <Sparkles size={15} />
            {draftLoading ? "Generating draft…" : "Generate Newsletter Draft"}
          </button>
        </div>
      </div>

      {/* ── Newsletter Draft ──────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--green)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
              2
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", letterSpacing: "-0.01em" }}>Newsletter Draft</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--green)", fontWeight: 500 }}>
            <Check size={13} />
            Auto-saved {savedAt}
          </div>
        </div>

        {/* Title / Subtitle — side-by-side 1fr 1fr */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "18px 22px 14px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Newsletter title…"
              style={{
                width: "100%", padding: "10px 12px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                outline: "none", color: "var(--text)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--orange)";
                e.target.style.boxShadow = "0 0 0 3px rgba(240,75,19,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>Subtitle</div>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle / deck…"
              style={{
                width: "100%", padding: "10px 12px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 13.5,
                outline: "none", color: "var(--text)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--orange)";
                e.target.style.boxShadow = "0 0 0 3px rgba(240,75,19,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Draft blocks — 3-column grid: 150px | 1fr | auto */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <DraftBlock section="hook" label="Opening Hook" />
          <DraftBlock section="body" label="Main Body" />
          <DraftBlock section="takeaways" label="Key Takeaways" />
          <DraftBlock section="cta" label="Closing CTA" />
        </div>

        {/* Subject lines — 1fr 1fr grid */}
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Subject Lines
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Left: subject line list */}
            <div style={{ background: "var(--surface-warm)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Select subject</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subjectLines.map((line, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSubjectIdx(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, textAlign: "left",
                      background: selectedSubjectIdx === i ? "var(--orange-soft)" : "transparent",
                      border: "1px solid transparent",
                      color: "var(--text)", fontSize: 13,
                      fontWeight: selectedSubjectIdx === i ? 600 : 400,
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${selectedSubjectIdx === i ? "var(--orange)" : "var(--border-strong)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {selectedSubjectIdx === i && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)" }} />
                      )}
                    </div>
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: preview text */}
            <div style={{ background: "var(--surface-warm)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Preview text</div>
              {previewTexts[selectedSubjectIdx] && (
                <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text)", margin: 0 }}>
                  {previewTexts[selectedSubjectIdx]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
