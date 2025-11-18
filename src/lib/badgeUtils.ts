import { UserBadge, BadgeProgress, UserProgress } from "@/types/gamification";
import { BADGES, getBadgeById } from "@/data/badges";
import { saveBadges, getUserBadges as getFirebaseBadges } from "./firebaseUserService";
import { useAuth } from "@/contexts/AuthContext";

const BADGES_STORAGE_KEY = "learnwise_user_badges";

/**
 * Get user-specific localStorage key for badges
 */
const getUserBadgeKey = (userId: string): string => {
  return `${BADGES_STORAGE_KEY}_${userId}`;
};

/**
 * Clean up old shared localStorage badge data (migration helper)
 * This should be called once per user on login to migrate from shared to user-specific storage
 */
export const cleanupOldBadgeStorage = (): void => {
  try {
    // Remove the old shared localStorage key if it exists
    if (localStorage.getItem(BADGES_STORAGE_KEY)) {
      console.log('Removing old shared badge storage...');
      localStorage.removeItem(BADGES_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error cleaning up old badge storage:', error);
  }
};

/**
 * Get user's badges from Firebase (with user-specific localStorage cache)
 * Each user now has their own localStorage key to prevent cross-contamination
 */
export const getUserBadges = async (userId?: string): Promise<string[]> => {
  try {
    // Try Firebase first
    if (userId) {
      const firebaseBadges = await getFirebaseBadges(userId);
      if (firebaseBadges && firebaseBadges.length > 0) {
        // Cache in user-specific localStorage
        try {
          const userBadges: UserBadge[] = firebaseBadges.map(id => ({
            badgeId: id,
            earnedAt: new Date().toISOString(),
            progress: 100,
            isUnlocked: true,
          }));
          localStorage.setItem(getUserBadgeKey(userId), JSON.stringify(userBadges));
        } catch (e) {
          console.error("Error caching badges to localStorage:", e);
        }
        return firebaseBadges;
      }
    }
  } catch (error) {
    console.error("Error fetching badges from Firebase:", error);
  }
  
  // Fall back to user-specific localStorage
  if (userId) {
    try {
      const stored = localStorage.getItem(getUserBadgeKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Convert UserBadge[] to string[]
        return parsed.filter(b => b.isUnlocked).map(b => b.badgeId);
      }
      return [];
    } catch (error) {
      console.error("Error reading badges from localStorage:", error);
      return [];
    }
  }
  
  return [];
};

/**
 * Synchronous getter that reads badges from user-specific localStorage.
 * Use this in places where synchronous array access is expected.
 * Requires userId parameter to ensure user-specific data.
 */
export const getUserBadgesSync = (userId?: string): UserBadge[] => {
  if (!userId) return [];
  
  try {
    const stored = localStorage.getItem(getUserBadgeKey(userId));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading badges from localStorage (sync):", error);
    return [];
  }
};

/**
 * Save user's badges to Firebase (and user-specific localStorage for offline)
 */
export const saveUserBadges = async (badges: UserBadge[], userId?: string): Promise<void> => {
  // Save to user-specific localStorage for offline
  if (userId) {
    try {
      localStorage.setItem(getUserBadgeKey(userId), JSON.stringify(badges));
    } catch (error) {
      console.error("Error saving badges to localStorage:", error);
    }
  }
  
  // Save to Firebase
  if (userId) {
    try {
      const badgeIds = badges.filter(b => b.isUnlocked).map(b => b.badgeId);
      await saveBadges(userId, badgeIds);
    } catch (error) {
      console.error("Error saving badges to Firebase:", error);
    }
  }
};

/**
 * Check if user has earned a badge
 */
export const hasBadge = (badgeId: string, userId?: string): boolean => {
  if (!userId) return false;
  const userBadges = getUserBadgesSync(userId);
  return userBadges.some((b) => b.badgeId === badgeId && b.isUnlocked);
};

/**
 * Award a badge to the user
 */
export const awardBadge = (badgeId: string, userId?: string): boolean => {
  if (!userId) return false;
  
  if (hasBadge(badgeId, userId)) return false;

  const userBadges = getUserBadgesSync(userId);
  const existingBadge = userBadges.find((b) => b.badgeId === badgeId);

  if (existingBadge) {
    existingBadge.isUnlocked = true;
    existingBadge.earnedAt = new Date().toISOString();
    existingBadge.progress = 100;
  } else {
    userBadges.push({
      badgeId,
      earnedAt: new Date().toISOString(),
      progress: 100,
      isUnlocked: true,
    });
  }

  saveUserBadges(userBadges, userId);
  return true;
};

/**
 * Update badge progress
 */
export const updateBadgeProgress = (badgeId: string, progress: number, userId?: string): void => {
  if (!userId) return;
  
  const userBadges = getUserBadgesSync(userId);
  const badge = getBadgeById(badgeId);
  if (!badge) return;

  const existingBadge = userBadges.find((b) => b.badgeId === badgeId);
  const progressPercent = Math.min((progress / badge.target) * 100, 100);

  if (existingBadge) {
    existingBadge.progress = progressPercent;
    if (progressPercent >= 100 && !existingBadge.isUnlocked) {
      existingBadge.isUnlocked = true;
      existingBadge.earnedAt = new Date().toISOString();
    }
  } else {
    userBadges.push({
      badgeId,
      earnedAt: progressPercent >= 100 ? new Date().toISOString() : "",
      progress: progressPercent,
      isUnlocked: progressPercent >= 100,
    });
  }

  saveUserBadges(userBadges, userId);
};

/**
 * Get all badge progress (earned + in progress) for a specific user
 */
export const getAllBadgeProgress = (userId?: string): BadgeProgress[] => {
  if (!userId) {
    // Return all badges as locked if no user
    return BADGES.map((badge) => ({
      badge,
      progress: 0,
      isUnlocked: false,
      earnedAt: undefined,
    }));
  }
  
  const userBadges = getUserBadgesSync(userId);

  return BADGES.map((badge) => {
    const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

    return {
      badge,
      progress: userBadge?.progress || 0,
      isUnlocked: userBadge?.isUnlocked || false,
      earnedAt: userBadge?.earnedAt,
    };
  });
};

/**
 * Get earned badges for a specific user
 */
export const getEarnedBadges = (userId?: string): BadgeProgress[] => {
  return getAllBadgeProgress(userId).filter((bp) => bp.isUnlocked);
};

/**
 * Get badges in progress for a specific user
 */
export const getBadgesInProgress = (userId?: string): BadgeProgress[] => {
  return getAllBadgeProgress(userId).filter((bp) => !bp.isUnlocked && bp.progress > 0);
};

/**
 * Get locked badges for a specific user
 */
export const getLockedBadges = (userId?: string): BadgeProgress[] => {
  return getAllBadgeProgress(userId).filter((bp) => !bp.isUnlocked && bp.progress === 0);
};

/**
 * Check and award badges based on user activity
 * Returns newly earned badge IDs
 */
export const checkAndAwardBadges = async (
  userId: string,
  userStats: {
    totalQuizzes: number;
    currentStreak: number;
    currentRating: number;
    lastQuizAccuracy?: number;
  }
): Promise<string[]> => {
  const newlyEarnedBadges: string[] = [];
  const currentBadges = await getUserBadges(userId);

  const hasBadgeAlready = (badgeId: string) => currentBadges.includes(badgeId);

  // Check quiz completion badges
  const quizCount = userStats.totalQuizzes;

  if (quizCount >= 1 && !hasBadgeAlready("first_quiz")) {
    newlyEarnedBadges.push("first_quiz");
  }
  if (quizCount >= 10 && !hasBadgeAlready("quiz_10")) {
    newlyEarnedBadges.push("quiz_10");
  }
  if (quizCount >= 50 && !hasBadgeAlready("quiz_50")) {
    newlyEarnedBadges.push("quiz_50");
  }
  if (quizCount >= 100 && !hasBadgeAlready("quiz_100")) {
    newlyEarnedBadges.push("quiz_100");
  }

  // Check streak badges
  const streak = userStats.currentStreak;

  if (streak >= 7 && !hasBadgeAlready("week_warrior")) {
    newlyEarnedBadges.push("week_warrior");
  }
  if (streak >= 30 && !hasBadgeAlready("month_master")) {
    newlyEarnedBadges.push("month_master");
  }
  if (streak >= 365 && !hasBadgeAlready("year_champion")) {
    newlyEarnedBadges.push("year_champion");
  }

  // Check rating badges
  const rating = userStats.currentRating;

  if (rating >= 1000 && !hasBadgeAlready("rating_1000")) {
    newlyEarnedBadges.push("rating_1000");
  }
  if (rating >= 1500 && !hasBadgeAlready("rating_1500")) {
    newlyEarnedBadges.push("rating_1500");
  }
  if (rating >= 2000 && !hasBadgeAlready("rating_2000")) {
    newlyEarnedBadges.push("rating_2000");
  }
  if (rating >= 2500 && !hasBadgeAlready("rating_2500")) {
    newlyEarnedBadges.push("rating_2500");
  }

  // Check perfect score badge
  if (userStats.lastQuizAccuracy === 100 && !hasBadgeAlready("perfect_score")) {
    newlyEarnedBadges.push("perfect_score");
  }

  // Save newly earned badges
  if (newlyEarnedBadges.length > 0) {
    const allBadges = [...currentBadges, ...newlyEarnedBadges];
    await saveBadges(userId, allBadges);
    
    // Also save to user-specific localStorage as UserBadge[]
    const userBadges: UserBadge[] = allBadges.map(id => ({
      badgeId: id,
      earnedAt: new Date().toISOString(),
      progress: 100,
      isUnlocked: true,
    }));
    localStorage.setItem(getUserBadgeKey(userId), JSON.stringify(userBadges));
    
    console.log(`🎉 Newly earned badges for user ${userId}:`, newlyEarnedBadges);
  }

  return newlyEarnedBadges;
};

/**
 * Get badge statistics for a specific user
 */
export const getBadgeStats = (userId?: string) => {
  const allProgress = getAllBadgeProgress(userId);
  const earned = allProgress.filter((bp) => bp.isUnlocked);
  const inProgress = allProgress.filter((bp) => !bp.isUnlocked && bp.progress > 0);
  const locked = allProgress.filter((bp) => !bp.isUnlocked && bp.progress === 0);

  return {
    total: BADGES.length,
    earned: earned.length,
    inProgress: inProgress.length,
    locked: locked.length,
    completionRate: (earned.length / BADGES.length) * 100,
  };
};
