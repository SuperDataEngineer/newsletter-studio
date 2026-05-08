"use client";

import { useStudio } from "@/store/useStudio";

export function useScoring() {
  const { issueId, draft, brief, audience, setScore, scoreLoading, setScoreLoading } = useStudio();

  const scoreNow = async () => {
    if (!issueId || !brief || scoreLoading) return;
    setScoreLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, brief, audience }),
      });
      if (!res.ok) throw new Error("Score failed");
      const data = await res.json();
      setScore(data);
    } catch (err) {
      console.error("[score]", err);
    } finally {
      setScoreLoading(false);
    }
  };

  return { scoreNow, scoreLoading };
}
