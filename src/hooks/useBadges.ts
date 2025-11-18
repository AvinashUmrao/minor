import { useState, useEffect } from "react";
import { BadgeProgress } from "@/types/gamification";
import { BADGES } from "@/data/badges";
import { getUserBadges, cleanupOldBadgeStorage } from "@/lib/badgeUtils";
import { useAuth } from "@/contexts/AuthContext";

export const useBadges = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<BadgeProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<BadgeProgress[]>([]);
  const [inProgressBadges, setInProgressBadges] = useState<BadgeProgress[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeProgress[]>([]);
  const [stats, setStats] = useState({ total: BADGES.length, earned: 0, locked: BADGES.length, inProgress: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      // Clean up old shared localStorage on first load
      cleanupOldBadgeStorage();
      
      // Get earned badge IDs from Firebase (user-specific)
      const earnedBadgeIds = user ? await getUserBadges(user.id) : [];
      
      // Map all badges to BadgeProgress format
      const allProgress: BadgeProgress[] = BADGES.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        return {
          badge,
          progress: isEarned ? 100 : 0,
          isUnlocked: isEarned,
          earnedAt: isEarned ? new Date().toISOString() : undefined,
        };
      });

      const earned = allProgress.filter(bp => bp.isUnlocked);
      const inProgress = allProgress.filter(bp => !bp.isUnlocked && bp.progress > 0);
      const locked = allProgress.filter(bp => !bp.isUnlocked && bp.progress === 0);

      setAllBadges(allProgress);
      setEarnedBadges(earned);
      setInProgressBadges(inProgress);
      setLockedBadges(locked);
      setStats({
        total: BADGES.length,
        earned: earned.length,
        inProgress: inProgress.length,
        locked: locked.length,
        completionRate: (earned.length / BADGES.length) * 100,
      });
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const refreshBadges = () => {
    loadBadges();
  };

  return {
    allBadges,
    earnedBadges,
    inProgressBadges,
    lockedBadges,
    stats,
    isLoading,
    refreshBadges,
  };
};
