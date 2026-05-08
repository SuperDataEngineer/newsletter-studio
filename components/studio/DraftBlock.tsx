"use client";

import { useState } from "react";
import { useStudio } from "@/store/useStudio";
import { CustomEditModal } from "./CustomEditModal";
import { SectionExpandModal } from "./SectionExpandModal";
import { useScoring } from "@/hooks/useScoring";
import type { DraftSection, RefineAction } from "@/lib/types";

type ActionCategory = "rewrite" | "add" | "tone" | "custom";

interface ActionConfig {
  label: RefineAction;
  icon: string;
  category: ActionCategory;
}

const CATEGORY_STYLES: Record<ActionCategory, { color: string; bg: string; border: string }> = {
  rewrite: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  add:     { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  tone:    { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  custom:  { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
};

const ACTIONS: Record<DraftSection, ActionConfig[]> = {
  hook: [
    { label: "Rewrite Intro",       icon: "🔄", category: "rewrite" },
    { label: "Add Data",            icon: "➕", category: "add" },
    { label: "Make Sharper",        icon: "⚡", category: "tone" },
    { label: "Make More Executive", icon: "🎯", category: "tone" },
  ],
  body: [
    { label: "Make Sharper",  icon: "⚡", category: "tone" },
    { label: "Expand",        icon: "➕", category: "add" },
    { label: "Add Examples",  icon: "➕", category: "add" },
    { label: "Add Source",    icon: "➕", category: "add" },
    { label: "Simplify",      icon: "🔄", category: "rewrite" },
  ],
  takeaways: [
    { label: "Shorten",        icon: "✂️", category: "tone" },
    { label: "Add Examples",   icon: "➕", category: "add" },
    { label: "Make Tactical",  icon: "🎯", category: "tone" },
    { label: "Make Executive", icon: "🎯", category: "tone" },
  ],
  cta: [
    { label: "Make Bolder", icon: "⚡", category: "tone" },
    { label: "Shorten",     icon: "✂️", category: "tone" },
    { label: "Add CTA",     icon: "➕", category: "add" },
    { label: "Make Softer", icon: "🔄", category: "rewrite" },
  ],
};

const WORD_TARGETS: Record<DraftSection, [number, number]> = {
  hook:      [100, 200],
  body:      [700, 1100],
  takeaways: [60, 120],
  cta:       [40, 80],
};

const SECTION_ICONS: Record<DraftSection, string> = {
  hook: "⚡", body: "📝", takeaways: "✓", cta: "→",
};

function countWords(text: unknown) {
  if (typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface DraftBlockProps {
  section: DraftSection;
  label: string;
}

export function DraftBlock({ section, label }: DraftBlockProps) {
  const { issueId, draft, setDraftSection, activeSection, setActiveSection, refiningSection, setRefiningSection } = useStudio();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const { scoreNow } = useScoring();

  const isActive = activeSection === section;
  const isRefining = refiningSection === section;
  const text = draft[section];
  const wordCount = countWords(text);
  const [minW, maxW] = WORD_TARGETS[section];

  const wordStatus = wordCount >= minW && wordCount <= maxW
    ? { color: "var(--green)", suffix: " ✓" }
    : wordCount > maxW
    ? { color: "var(--orange)", suffix: " ↑" }
    : { color: "var(--muted-2)", suffix: "" };

  const callRefine = async (action: RefineAction | null, customInstruction?: string) => {
    if (!issueId || isRefining) return;
    setRefiningSection(section);
    try {
      const res = await fetch(`/api/issues/${issueId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, action, currentText: text, customInstruction }),
      });
      if (!res.ok) throw new Error("Refine failed");
      const data = await res.json();
      setDraftSection(section, data.text);
      // Re-score in background after content changes
      scoreNow();
    } catch (err) {
      console.error("[refine]", err);
    } finally {
      setRefiningSection(null);
      setShowCustomModal(false);
    }
  };

  return (
    <>
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "1px solid var(--border)",
          background: isActive ? "var(--surface-warm)" : "transparent",
          transition: "background 0.2s",
          cursor: "pointer",
        }}
        onClick={() => setActiveSection(section)}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>{SECTION_ICONS[section]}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "var(--orange)" : "var(--text)" }}>
              {label}
            </span>
            {isRefining && (
              <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>Refining…</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: wordStatus.color, fontWeight: 500 }}>
              {wordCount} words · {minW}–{maxW}{wordStatus.suffix}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowExpandModal(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 11px", borderRadius: 20,
                border: "1px solid var(--orange-soft-2)",
                background: "var(--orange-soft)",
                color: "var(--orange)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", flexShrink: 0,
                transition: "filter 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.filter = "brightness(0.93)"; }}
              onMouseLeave={(e) => { (e.currentTarget).style.filter = "none"; }}
            >
              <span style={{ fontSize: 13 }}>⤢</span>
              Expand
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />

        {/* ── Textarea ── */}
        <textarea
          value={text}
          onChange={(e) => { e.stopPropagation(); setDraftSection(section, e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", minHeight: 90, border: "none", outline: "none",
            resize: "none", background: "transparent",
            lineHeight: 1.6, fontSize: 13.5, color: "var(--text)", padding: 0,
          }}
        />

        {/* ── Action pills ── */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          {ACTIONS[section].map(({ label: actionLabel, icon, category }) => {
            const s = CATEGORY_STYLES[category];
            return (
              <button
                key={actionLabel}
                onClick={() => callRefine(actionLabel)}
                disabled={isRefining}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 11px", borderRadius: 20,
                  border: `1px solid ${s.border}`, background: s.bg,
                  color: s.color, fontSize: 12, fontWeight: 500,
                  cursor: isRefining ? "not-allowed" : "pointer",
                  opacity: isRefining ? 0.5 : 1,
                  transition: "opacity 0.15s, filter 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isRefining) (e.currentTarget as HTMLElement).style.filter = "brightness(0.92)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
              >
                <span style={{ fontSize: 11 }}>{icon}</span>
                {actionLabel}
              </button>
            );
          })}

          {/* Custom pill */}
          <button
            onClick={() => !isRefining && setShowCustomModal(true)}
            disabled={isRefining}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 20,
              border: "1px solid #DDD6FE", background: "#F5F3FF",
              color: "#7C3AED", fontSize: 12, fontWeight: 500,
              cursor: isRefining ? "not-allowed" : "pointer",
              opacity: isRefining ? 0.5 : 1,
              transition: "opacity 0.15s, filter 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { if (!isRefining) (e.currentTarget as HTMLElement).style.filter = "brightness(0.92)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
          >
            <span style={{ fontSize: 11 }}>✏️</span>
            Custom…
          </button>
        </div>
      </div>

      {showCustomModal && (
        <CustomEditModal
          section={section}
          label={label}
          loading={isRefining}
          onClose={() => setShowCustomModal(false)}
          onApply={(instruction) => callRefine(null, instruction)}
        />
      )}

      {showExpandModal && (
        <SectionExpandModal
          section={section}
          label={label}
          text={text ?? ""}
          wordCount={wordCount}
          wordTarget={WORD_TARGETS[section]}
          onChange={(val) => setDraftSection(section, val)}
          onClose={() => setShowExpandModal(false)}
        />
      )}
    </>
  );
}
