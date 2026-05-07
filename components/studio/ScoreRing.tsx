"use client";

import type { IssueScore } from "@/lib/types";

const SUBSCORE_LABELS: Record<string, string> = {
  originality: "Originality",
  sourceStrength: "Source Strength",
  executiveRelevance: "Exec Relevance",
  clarity: "Clarity",
  readability: "Readability",
};

const SUBSCORE_ICONS: Record<string, string> = {
  originality: "◆",
  sourceStrength: "⬡",
  executiveRelevance: "▲",
  clarity: "◎",
  readability: "≡",
};

function statusColor(status: IssueScore["status"]) {
  if (status === "ready") return "var(--green)";
  if (status === "ready_with_refinements") return "var(--orange)";
  return "#dc2626";
}

function statusLabel(status: IssueScore["status"]) {
  if (status === "ready") return "Ready to publish";
  if (status === "ready_with_refinements") return "Ready with refinements";
  return "Needs work";
}

function barColor(value: number) {
  if (value >= 16) return "var(--green)";
  if (value >= 12) return "var(--orange)";
  return "#dc2626";
}

export function ScoreRing({ score }: { score: IssueScore }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div>
      {/* Ring + summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18, marginTop: 4 }}>
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={60} cy={60} r={radius} fill="none" stroke="#f1e7df" strokeWidth={9} />
            <circle
              cx={60} cy={60} r={radius} fill="none"
              stroke="#f04b13" strokeWidth={9}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "var(--orange)", lineHeight: 1 }}>
              {score.total}
            </span>
            <span style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>/100</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: statusColor(score.status), marginBottom: 6 }}>
            {statusLabel(score.status)}
          </div>
          {score.recommendations.map((r, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 3 }}>
              · {r}
            </div>
          ))}
        </div>
      </div>

      {/* Score bars — 150px label | 1fr track | 42px num | 18px icon */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(score.scores).map(([key, sub]) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 42px 18px",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{SUBSCORE_ICONS[key]}</span>
              {SUBSCORE_LABELS[key]}
            </div>
            <div style={{ height: 6, background: "#f1e7df", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", borderRadius: 999,
                  background: barColor(sub.value),
                  width: `${(sub.value / 20) * 100}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500, textAlign: "right" }}>
              {sub.value}/20
            </div>
            <div style={{ fontSize: 12, color: sub.value >= 16 ? "var(--green)" : sub.value >= 12 ? "var(--orange)" : "#dc2626" }}>
              {sub.value >= 16 ? "✓" : sub.value >= 12 ? "~" : "!"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
