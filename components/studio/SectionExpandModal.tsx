"use client";

import type { DraftSection } from "@/lib/types";

const SECTION_ICONS: Record<DraftSection, string> = {
  hook: "⚡", body: "📝", takeaways: "✓", cta: "→",
};

interface SectionExpandModalProps {
  section: DraftSection;
  label: string;
  text: string;
  wordCount: number;
  wordTarget: [number, number];
  onChange: (text: string) => void;
  onClose: () => void;
}

export function SectionExpandModal({
  section, label, text, wordCount, wordTarget, onChange, onClose,
}: SectionExpandModalProps) {
  const [minW, maxW] = wordTarget;
  const wordStatus = wordCount >= minW && wordCount <= maxW
    ? { color: "var(--green)", suffix: " ✓" }
    : wordCount > maxW
    ? { color: "var(--orange)", suffix: " ↑" }
    : { color: "var(--muted-2)", suffix: "" };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)", borderRadius: 14,
          border: "1px solid var(--border)",
          width: "92vw", height: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 24px", borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{SECTION_ICONS[section]}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12.5, color: wordStatus.color, fontWeight: 500 }}>
              {wordCount} words · {minW}–{maxW}{wordStatus.suffix}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 7,
                border: "1px solid var(--border)", background: "var(--surface-warm)",
                color: "var(--muted)", fontSize: 18, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          autoFocus
          value={text}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, width: "100%", padding: "22px 24px",
            border: "none", outline: "none", resize: "none",
            background: "transparent",
            fontSize: 15.5, lineHeight: 1.85, color: "var(--text)",
            fontFamily: "inherit",
          }}
        />

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: 7,
              border: "1px solid var(--border)", background: "var(--surface-warm)",
              color: "var(--text)", fontSize: 13.5, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
