"use client";

import { useState, useCallback } from "react";
import { ActivityData } from "@/types";

export function useShareSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityData | null>(null);

  const openShareSheet = useCallback((activity: ActivityData) => {
    setActiveActivity(activity);
    setIsOpen(true);
  }, []);

  const closeShareSheet = useCallback(() => {
    setIsOpen(false);
    // Don't null the activity immediately to avoid UI flicker during slide-down animation
    setTimeout(() => setActiveActivity(null), 300);
  }, []);

  return {
    isOpen,
    activeActivity,
    openShareSheet,
    closeShareSheet,
  };
}
