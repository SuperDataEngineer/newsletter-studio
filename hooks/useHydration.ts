"use client";

import { useEffect, useState } from "react";
import { useStudio } from "@/store/useStudio";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinish = useStudio.persist.onFinishHydration(() => setHydrated(true));
    // Handle case where hydration already completed before this effect ran
    if (useStudio.persist.hasHydrated()) setHydrated(true);
    return unsubFinish;
  }, []);

  return hydrated;
}
