"use client";

import { Lock, LucideIcon } from "lucide-react";

interface ExportTileProps {
  label: string;
  Icon: LucideIcon;
  locked?: boolean;
  accent?: boolean;
  onClick: () => void;
}

export function ExportTile({ label, Icon, locked, accent, onClick }: ExportTileProps) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
        padding: "14px 8px", borderRadius: 10,
        background: locked ? "var(--surface-warm)" : "var(--surface)",
        border: "1px solid var(--border)",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.65 : 1,
        transition: "all 0.15s",
        fontWeight: 500,
      }}
      onMouseEnter={(e) => {
        if (!locked) {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-warm)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
        }
      }}
      onMouseLeave={(e) => {
        if (!locked) {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: accent ? "var(--orange-soft)" : "var(--surface-warm)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon size={16} color={accent ? "var(--orange)" : "var(--muted)"} />
      </div>
      <span style={{ fontSize: 12.5, color: locked ? "var(--muted-2)" : "var(--text)" }}>
        {label}
      </span>
      {locked && (
        <span style={{ position: "absolute", top: 8, right: 8 }}>
          <Lock size={10} color="var(--muted-2)" />
        </span>
      )}
    </button>
  );
}
