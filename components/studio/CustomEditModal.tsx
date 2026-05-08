"use client";

import { useState } from "react";
import type { DraftSection } from "@/lib/types";

const EXAMPLE_PROMPTS: Record<DraftSection, string[]> = {
  hook: [
    "Add a specific stat and make it more urgent",
    "Start with a provocative question instead",
    "Reference a recent news event to anchor it",
  ],
  body: [
    "Add a quote from an industry expert",
    "Include a step-by-step breakdown in the middle",
    "Make it less technical — rewrite for a non-technical exec",
  ],
  takeaways: [
    "Make each takeaway start with an action verb",
    "Add a specific metric or outcome to each point",
    "Shorten to 3 bullets, keep only the sharpest ones",
  ],
  cta: [
    "Make the urgency clearer — why act now?",
    "Add a concrete next step the reader can take today",
    "Soften it — recommendation rather than command",
  ],
};

interface CustomEditModalProps {
  section: DraftSection;
  label: string;
  onClose: () => void;
  onApply: (instruction: string) => void;
  loading: boolean;
}

export function CustomEditModal({ section, label, onClose, onApply, loading }: CustomEditModalProps) {
  const [instruction, setInstruction] = useState("");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)", borderRadius: 14,
          border: "1px solid var(--border)",
          width: 480, padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>✏️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                Custom Edit
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{label}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
              background: "var(--surface-warm)", color: "var(--muted)",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Instruction input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>
            Tell me what you want to change:
          </div>
          <textarea
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Add a stat about enterprise adoption and make it more urgent"
            rows={4}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface-warm)",
              fontSize: 13.5, lineHeight: 1.55, color: "var(--text)",
              resize: "none", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#DDD6FE"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Example prompts */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>
            💡 Example prompts:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {EXAMPLE_PROMPTS[section].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInstruction(prompt)}
                style={{
                  textAlign: "left", padding: "6px 10px", borderRadius: 6,
                  border: "1px solid var(--border)", background: "var(--surface-warm)",
                  color: "var(--muted)", fontSize: 12.5, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.background = "#F5F3FF";
                  (e.currentTarget).style.borderColor = "#DDD6FE";
                  (e.currentTarget).style.color = "#7C3AED";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.background = "var(--surface-warm)";
                  (e.currentTarget).style.borderColor = "var(--border)";
                  (e.currentTarget).style.color = "var(--muted)";
                }}
              >
                · {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px", borderRadius: 7, border: "1px solid var(--border)",
              background: "var(--surface-warm)", color: "var(--muted)",
              fontSize: 13.5, fontWeight: 500, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => instruction.trim() && onApply(instruction.trim())}
            disabled={!instruction.trim() || loading}
            style={{
              padding: "9px 18px", borderRadius: 7, border: "none",
              background: instruction.trim() && !loading ? "#7C3AED" : "var(--border)",
              color: instruction.trim() && !loading ? "#fff" : "var(--muted)",
              fontSize: 13.5, fontWeight: 600,
              cursor: instruction.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}
          >
            {loading ? "Applying…" : "✨ Apply Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
