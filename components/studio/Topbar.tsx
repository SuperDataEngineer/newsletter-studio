"use client";

import { BookOpen, Settings, Upload } from "lucide-react";

const NAV_TABS = ["Workspace", "History", "Templates", "Settings"];

export function Topbar() {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px,1fr) auto minmax(280px,1fr)",
        alignItems: "center",
        padding: "14px 24px",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        height: 65,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--orange-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOpen size={18} color="var(--orange)" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
          Newsletter Studio
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            style={{
              position: "relative",
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: tab === "Workspace" ? 600 : 500,
              color: tab === "Workspace" ? "var(--orange)" : "var(--muted)",
              borderRadius: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab}
            {tab === "Workspace" && (
              <span
                style={{
                  position: "absolute",
                  left: 18,
                  right: 18,
                  bottom: -2,
                  height: 2,
                  background: "var(--orange)",
                  borderRadius: 2,
                }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            fontWeight: 500,
            fontSize: 13.5,
          }}
        >
          <Settings size={15} />
          Settings
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--orange)",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          <Upload size={15} />
          Publish
        </button>
      </div>
    </header>
  );
}
