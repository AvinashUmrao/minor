import { useState, useEffect } from "react";
import { BadgeProgress } from "@/types/gamification";
import {
  getAllBadgeProgress,
  getEarnedBadges,
  getBadgesInProgress,
  getLockedBadges,
  getBadgeStats,
  awardBadge,
  updateBadgeProgress,
} from "@/lib/badgeUtils";

export const useBadges = () => {
  const [allBadges, setAllBadges] = useState<BadgeProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<BadgeProgress[]>([]);
  const [inProgressBadges, setInProgressBadges] = useState<BadgeProgress[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeProgress[]>([]);
  const [stats, setStats] = useState(getBadgeStats());
  const [isLoading, setIsLoading] = useState(true);

  const loadBadges = () => {
    setAllBadges(getAllBadgeProgress());
    setEarnedBadges(getEarnedBadges());
    setInProgressBadges(getBadgesInProgress());
    setLockedBadges(getLockedBadges());
    setStats(getBadgeStats());
    setIsLoading(false);
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const refreshBadges = () => {
    loadBadges();
  };

  const unlockBadge = (badgeId: string): boolean => {
    const success = awardBadge(badgeId);
    if (success) {
      refreshBadges();
    }
    return success;
  };

  const updateProgress = (badgeId: string, progress: number) => {
    updateBadgeProgress(badgeId, progress);
    refreshBadges();
  };

  return {
    allBadges,
    earnedBadges,
    inProgressBadges,
    lockedBadges,
    stats,
    isLoading,
    refreshBadges,
    unlockBadge,
    updateProgress,
  };
};
