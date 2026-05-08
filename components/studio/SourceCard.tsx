"use client";

import { ExternalLink } from "lucide-react";
import type { ResearchSource } from "@/lib/types";

const DOMAIN_COLORS: Record<string, string> = {
  "gartner.com": "#2D6FE0",
  "mckinsey.com": "#1B3A57",
  "bcg.com": "#0E6A47",
  "openai.com": "#0F0F0F",
  "deloitte.com": "#0E4A2F",
  "wsj.com": "#C8553D",
  "ft.com": "#C8553D",
  "bloomberg.com": "#1A1A1A",
};

const PALETTE = [
  "#2D6FE0", "#0E6A47", "#C8553D", "#7C3AED", "#0E7490",
  "#B45309", "#1D4ED8", "#065F46", "#9D174D", "#1E40AF",
  "#4D7C0F", "#6D28D9", "#0369A1", "#92400E", "#166534",
];

function domainColor(domain: string): string {
  if (DOMAIN_COLORS[domain]) return DOMAIN_COLORS[domain];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function domainInitials(domain: string) {
  const name = domain.replace(/\.(com|org|gov|net|io|co)$/, "").split(".").pop() ?? domain;
  return name.slice(0, 2).toUpperCase();
}

export function SourceCard({ source }: { source: ResearchSource }) {
  const color = domainColor(source.domain);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 12px", background: "var(--surface-warm)",
        border: "1px solid var(--border)", borderRadius: 10,
        textDecoration: "none", color: "inherit",
        transition: "all 0.15s", minWidth: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLElement).style.background = "#fff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface-warm)";
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 6, flexShrink: 0,
          background: color, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
        }}
      >
        {domainInitials(source.domain)}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div
          style={{
            fontSize: 12.5, fontWeight: 600, color: "var(--text)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {source.title}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <ExternalLink size={10} />
          {source.domain}
        </div>
      </div>
    </a>
  );
}
