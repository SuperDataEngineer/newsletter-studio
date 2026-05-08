"use client";

import { useState } from "react";
import { BookOpen, Upload, Check } from "lucide-react";
import { useStudio } from "@/store/useStudio";

const NAV_TABS = ["Workspace", "History", "Templates", "Settings"] as const;

export function Topbar() {
  const { issueId, currentTab, setCurrentTab } = useStudio();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!issueId || publishing) return;
    setPublishing(true);
    try {
      await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        setCurrentTab("History");
      }, 1200);
    } catch { /* silent */ } finally {
      setPublishing(false);
    }
  };

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
            width: 36, height: 36, borderRadius: 8,
            background: "var(--orange-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
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
        {NAV_TABS.map((tab) => {
          const active = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              style={{
                position: "relative",
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--orange)" : "var(--muted)",
                borderRadius: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    left: 18, right: 18, bottom: -2,
                    height: 2,
                    background: "var(--orange)",
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
        <button
          onClick={handlePublish}
          disabled={!issueId || publishing || published}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8,
            background: published ? "var(--green)" : publishing ? "var(--muted-2)" : "var(--orange)",
            border: "none", color: "#fff",
            fontWeight: 600, fontSize: 13.5,
            cursor: !issueId || publishing || published ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            opacity: !issueId ? 0.5 : 1,
          }}
        >
          {published ? <Check size={15} /> : <Upload size={15} />}
          {published ? "Published!" : publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </header>
  );
}
