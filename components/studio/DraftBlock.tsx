"use client";

import { useStudio } from "@/store/useStudio";
import type { DraftSection, RefineAction } from "@/lib/types";

const ACTIONS: Record<DraftSection, RefineAction[]> = {
  hook: ["Rewrite Intro", "Add Data", "Make Sharper", "Make More Executive"],
  body: ["Make Sharper", "Expand", "Add Examples", "Add Source", "Simplify"],
  takeaways: ["Shorten", "Add Examples", "Make Tactical", "Make Executive"],
  cta: ["Make Bolder", "Shorten", "Add CTA", "Make Softer"],
};

const SECTION_ICONS: Record<DraftSection, string> = {
  hook: "⚡",
  body: "📝",
  takeaways: "✓",
  cta: "→",
};

interface DraftBlockProps {
  section: DraftSection;
  label: string;
}

export function DraftBlock({ section, label }: DraftBlockProps) {
  const { draft, setDraftSection, activeSection, setActiveSection, refiningSection } = useStudio();
  const isActive = activeSection === section;
  const isRefining = refiningSection === section;
  const text = draft[section];

  // TODO: wire applyAction to POST /api/issues/[id]/refine
  const applyAction = (action: RefineAction) => {
    console.log("refine", section, action);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr auto",
        gap: 14,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        alignItems: "flex-start",
        background: isActive ? "var(--surface-warm)" : "transparent",
        transition: "background 0.2s",
        cursor: "pointer",
      }}
      onClick={() => setActiveSection(section)}
    >
      {/* Label column */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingTop: 2 }}>
        <span style={{ fontSize: 14 }}>{SECTION_ICONS[section]}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "var(--orange)" : "var(--text)", lineHeight: 1.3 }}>
            {label}
          </div>
          {isRefining && (
            <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 2 }}>Refining…</div>
          )}
        </div>
      </div>

      {/* Content column */}
      <textarea
        value={text}
        onChange={(e) => { e.stopPropagation(); setDraftSection(section, e.target.value); }}
        onClick={(e) => e.stopPropagation()}
        rows={3}
        style={{
          width: "100%", border: "none", outline: "none",
          resize: "none", background: "transparent",
          lineHeight: 1.55, fontSize: 13.5, color: "var(--text)", padding: 0,
        }}
      />

      {/* Actions column */}
      <div
        style={{
          display: "flex", flexDirection: "column", gap: 6,
          minWidth: 120, alignItems: "stretch",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {ACTIONS[section].map((action) => (
          <button
            key={action}
            onClick={() => applyAction(action)}
            style={{
              padding: "6px 10px", borderRadius: 6, textAlign: "left",
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--muted)", fontSize: 12, fontWeight: 500,
              whiteSpace: "nowrap", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "var(--orange-soft)";
              (e.target as HTMLButtonElement).style.borderColor = "#f5c8b0";
              (e.target as HTMLButtonElement).style.color = "var(--orange)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "var(--surface)";
              (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.target as HTMLButtonElement).style.color = "var(--muted)";
            }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
