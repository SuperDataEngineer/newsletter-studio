"use client";

import { Topbar } from "./Topbar";
import { LeftPanel } from "./LeftPanel";
import { CenterPanel } from "./CenterPanel";
import { RightPanel } from "./RightPanel";

export function StudioShell() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Topbar />
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
    </div>
  );
}
