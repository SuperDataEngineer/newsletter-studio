"use client";

import { useState, KeyboardEvent, useRef } from "react";

interface TagInputSectionProps {
  label: string;
  placeholder: string;
  tags: string[];
  variant?: "company" | "keyword";
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export function TagInputSection({ label, placeholder, tags, variant = "keyword", onAdd, onRemove }: TagInputSectionProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
    if (e.key === "Backspace" && !input && tags.length) onRemove(tags[tags.length - 1]);
  };

  const tagStyle = variant === "company"
    ? { background: "var(--orange-soft)", borderColor: "#f5d6c2", color: "#b53b09" }
    : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</span>
          <span style={{
            fontSize: 11, color: "var(--muted)", background: "var(--surface-warm)",
            border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 999, fontWeight: 500,
          }}>
            {tags.length}
          </span>
        </div>
      </div>

      <div
        style={{
          background: "var(--surface-warm)", border: `1px solid ${focused ? "var(--orange)" : "var(--border)"}`,
          borderRadius: 10, padding: 10,
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          minHeight: 44, cursor: "text",
          boxShadow: focused ? "0 0 0 3px rgba(240,75,19,0.08)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 4px 4px 10px", border: "1px solid",
              borderRadius: 999, fontSize: 12.5, fontWeight: 500,
              ...tagStyle,
            }}
          >
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
              style={{
                width: 18, height: 18, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--muted)", fontSize: 14, lineHeight: 1,
                padding: 0, background: "none", border: "none", cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); commit(); }}
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{
            flex: 1, minWidth: 80, border: "none", outline: "none",
            background: "transparent", fontSize: 13, color: "var(--text)", padding: "4px",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 6, fontWeight: 500 }}>
        Press Enter or comma to add
      </div>
    </div>
  );
}
