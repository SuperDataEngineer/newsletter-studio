"use client";

import { Topbar } from "./Topbar";
import { LeftPanel } from "./LeftPanel";
import { CenterPanel } from "./CenterPanel";
import { RightPanel } from "./RightPanel";
import { HistoryPanel } from "./HistoryPanel";
import { useHydration } from "@/hooks/useHydration";
import { useStudio } from "@/store/useStudio";

export function StudioShell() {
  const hydrated = useHydration();
  const currentTab = useStudio((s) => s.currentTab);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Topbar />
      {!hydrated ? (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--muted-2)", fontSize: 13,
        }}>
          Loading workspace…
        </div>
      ) : currentTab === "History" ? (
        <HistoryPanel />
      ) : (
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "370px minmax(620px, 1fr) 430px",
            gap: "0",
            overflow: "hidden",
            height: "calc(100vh - 65px)",
          }}
        >
          <LeftPanel />
          <CenterPanel />
          <RightPanel />
        </div>
      )}
    </div>
  );
}
