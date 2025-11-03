import { UserBadge, BadgeProgress, UserProgress } from "@/types/gamification";
import { BADGES, getBadgeById } from "@/data/badges";

const BADGES_STORAGE_KEY = "learnwise_user_badges";

/**
 * Get user's badges from localStorage
 */
export const getUserBadges = (): UserBadge[] => {
  try {
    const stored = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading badges from localStorage:", error);
    return [];
  }
};

/**
 * Save user's badges to localStorage
 */
export const saveUserBadges = (badges: UserBadge[]): void => {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
  } catch (error) {
    console.error("Error saving badges to localStorage:", error);
  }
};

/**
 * Check if user has earned a badge
 */
export const hasBadge = (badgeId: string): boolean => {
  const userBadges = getUserBadges();
  return userBadges.some((b) => b.badgeId === badgeId && b.isUnlocked);
};

/**
 * Award a badge to the user
 */
export const awardBadge = (badgeId: string): boolean => {
  if (hasBadge(badgeId)) return false;

  const userBadges = getUserBadges();
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

  saveUserBadges(userBadges);
  return true;
};

/**
 * Update badge progress
 */
export const updateBadgeProgress = (badgeId: string, progress: number): void => {
  const userBadges = getUserBadges();
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

  saveUserBadges(userBadges);
};

/**
 * Get all badge progress (earned + in progress)
 */
export const getAllBadgeProgress = (): BadgeProgress[] => {
  const userBadges = getUserBadges();

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
 * Get earned badges
 */
export const getEarnedBadges = (): BadgeProgress[] => {
  return getAllBadgeProgress().filter((bp) => bp.isUnlocked);
};

/**
 * Get badges in progress
 */
export const getBadgesInProgress = (): BadgeProgress[] => {
  return getAllBadgeProgress().filter((bp) => !bp.isUnlocked && bp.progress > 0);
};

/**
 * Get locked badges
 */
export const getLockedBadges = (): BadgeProgress[] => {
  return getAllBadgeProgress().filter((bp) => !bp.isUnlocked && bp.progress === 0);
};

/**
 * Check and award badges based on user activity
 */
export const checkAndAwardBadges = (userProgress: Partial<UserProgress>): string[] => {
  const newlyEarnedBadges: string[] = [];

  // Check quiz completion badges
  if (userProgress.stats?.totalQuizzes) {
    const quizCount = userProgress.stats.totalQuizzes;

    if (quizCount >= 1 && !hasBadge("first_quiz")) {
      awardBadge("first_quiz");
      newlyEarnedBadges.push("first_quiz");
    }
    if (quizCount >= 10 && !hasBadge("quiz_10")) {
      awardBadge("quiz_10");
      newlyEarnedBadges.push("quiz_10");
    }
    if (quizCount >= 50 && !hasBadge("quiz_50")) {
      awardBadge("quiz_50");
      newlyEarnedBadges.push("quiz_50");
    }
    if (quizCount >= 100 && !hasBadge("quiz_100")) {
      awardBadge("quiz_100");
      newlyEarnedBadges.push("quiz_100");
    }

    // Update progress for next milestone
    updateBadgeProgress("first_quiz", quizCount);
    updateBadgeProgress("quiz_10", quizCount);
    updateBadgeProgress("quiz_50", quizCount);
    updateBadgeProgress("quiz_100", quizCount);
  }

  // Check streak badges
  if (userProgress.streak?.currentStreak) {
    const streak = userProgress.streak.currentStreak;

    if (streak >= 7 && !hasBadge("week_warrior")) {
      awardBadge("week_warrior");
      newlyEarnedBadges.push("week_warrior");
    }
    if (streak >= 30 && !hasBadge("month_master")) {
      awardBadge("month_master");
      newlyEarnedBadges.push("month_master");
    }
    if (streak >= 365 && !hasBadge("year_champion")) {
      awardBadge("year_champion");
      newlyEarnedBadges.push("year_champion");
    }

    updateBadgeProgress("week_warrior", streak);
    updateBadgeProgress("month_master", streak);
    updateBadgeProgress("year_champion", streak);
  }

  // Check rating badges
  if (userProgress.rating?.current) {
    const rating = userProgress.rating.current;

    if (rating >= 1000 && !hasBadge("rating_1000")) {
      awardBadge("rating_1000");
      newlyEarnedBadges.push("rating_1000");
    }
    if (rating >= 1500 && !hasBadge("rating_1500")) {
      awardBadge("rating_1500");
      newlyEarnedBadges.push("rating_1500");
    }
    if (rating >= 2000 && !hasBadge("rating_2000")) {
      awardBadge("rating_2000");
      newlyEarnedBadges.push("rating_2000");
    }
    if (rating >= 2500 && !hasBadge("rating_2500")) {
      awardBadge("rating_2500");
      newlyEarnedBadges.push("rating_2500");
    }

    updateBadgeProgress("rating_1000", rating);
    updateBadgeProgress("rating_1500", rating);
    updateBadgeProgress("rating_2000", rating);
    updateBadgeProgress("rating_2500", rating);
  }

  // Check blog badges
  if (userProgress.stats?.totalBlogsRead) {
    const blogsRead = userProgress.stats.totalBlogsRead;
    if (blogsRead >= 10 && !hasBadge("blog_reader")) {
      awardBadge("blog_reader");
      newlyEarnedBadges.push("blog_reader");
    }
    updateBadgeProgress("blog_reader", blogsRead);
  }

  if (userProgress.stats?.totalBlogsCreated) {
    const blogsCreated = userProgress.stats.totalBlogsCreated;
    if (blogsCreated >= 5 && !hasBadge("content_creator")) {
      awardBadge("content_creator");
      newlyEarnedBadges.push("content_creator");
    }
    updateBadgeProgress("content_creator", blogsCreated);
  }

  return newlyEarnedBadges;
};

/**
 * Get badge statistics
 */
export const getBadgeStats = () => {
  const allProgress = getAllBadgeProgress();
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
