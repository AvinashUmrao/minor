import {
  UserRating,
  RatingHistory,
  RatingBreakdown,
  RatingMilestone,
  SubjectRating,
} from "@/types/gamification";
import { getUserStreak } from "./streakUtils";

const RATING_STORAGE_KEY = "learnwise_user_rating";

/**
 * Initialize default rating data
 */
const initializeRating = (): UserRating => {
  return {
    current: 1000,
    peak: 1000,
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        rating: 1000,
        change: 0,
        reason: "Initial rating",
      },
    ],
    subjectRatings: [],
    percentile: 50,
    trend: "stable",
  };
};

/**
 * Get user's rating data from localStorage
 */
export const getUserRating = (): UserRating => {
  try {
    const stored = localStorage.getItem(RATING_STORAGE_KEY);
    if (!stored) return initializeRating();
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading rating from localStorage:", error);
    return initializeRating();
  }
};

/**
 * Save user's rating data to localStorage
 */
export const saveUserRating = (rating: UserRating): void => {
  try {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(rating));
  } catch (error) {
    console.error("Error saving rating to localStorage:", error);
  }
};

/**
 * Calculate rating change based on quiz performance
 */
export const calculateRatingChange = (
  score: number,
  totalQuestions: number,
  difficulty: "easy" | "medium" | "hard" = "medium",
  timeSpent: number = 0
): number => {
  const accuracy = score / totalQuestions;
  
  // Base points based on difficulty
  const difficultyMultiplier = {
    easy: 10,
    medium: 20,
    hard: 30,
  };

  let change = difficultyMultiplier[difficulty] * accuracy;

  // Bonus for perfect score
  if (accuracy === 1.0) {
    change += 20;
  }

  // Bonus for high accuracy
  if (accuracy >= 0.9) {
    change += 10;
  }

  // Speed bonus (if completed in less than 10 minutes)
  if (timeSpent > 0 && timeSpent < 600) {
    change += 5;
  }

  // Penalty for low accuracy
  if (accuracy < 0.5) {
    change = -Math.abs(change * 0.5);
  }

  return Math.round(change);
};

/**
 * Update user rating after quiz
 */
export const updateRatingAfterQuiz = (
  score: number,
  totalQuestions: number,
  subject: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  timeSpent: number = 0
): number => {
  const rating = getUserRating();
  const change = calculateRatingChange(score, totalQuestions, difficulty, timeSpent);
  
  // Update overall rating
  rating.current += change;
  if (rating.current > rating.peak) {
    rating.peak = rating.current;
  }

  // Add to history
  rating.history.push({
    date: new Date().toISOString().split("T")[0],
    rating: rating.current,
    change,
    reason: `Quiz completed: ${subject}`,
  });

  // Update subject rating
  updateSubjectRating(rating, subject, score, totalQuestions);

  // Update trend
  updateRatingTrend(rating);

  saveUserRating(rating);
  return change;
};

/**
 * Update subject-specific rating
 */
const updateSubjectRating = (
  rating: UserRating,
  subject: string,
  score: number,
  totalQuestions: number
): void => {
  let subjectRating = rating.subjectRatings.find((sr) => sr.subject === subject);

  if (!subjectRating) {
    subjectRating = {
      subject,
      rating: 1000,
      quizzesTaken: 0,
      accuracy: 0,
      lastAttempted: new Date().toISOString().split("T")[0],
    };
    rating.subjectRatings.push(subjectRating);
  }

  const accuracy = score / totalQuestions;
  const change = calculateRatingChange(score, totalQuestions);

  subjectRating.rating += change;
  subjectRating.quizzesTaken++;
  subjectRating.accuracy =
    (subjectRating.accuracy * (subjectRating.quizzesTaken - 1) + accuracy) /
    subjectRating.quizzesTaken;
  subjectRating.lastAttempted = new Date().toISOString().split("T")[0];
};

/**
 * Update rating trend based on recent history
 */
const updateRatingTrend = (rating: UserRating): void => {
  const recentHistory = rating.history.slice(-10);
  if (recentHistory.length < 3) {
    rating.trend = "stable";
    return;
  }

  const totalChange = recentHistory.reduce((sum, h) => sum + h.change, 0);
  const avgChange = totalChange / recentHistory.length;

  if (avgChange > 5) {
    rating.trend = "improving";
  } else if (avgChange < -5) {
    rating.trend = "declining";
  } else {
    rating.trend = "stable";
  }
};

/**
 * Get rating breakdown
 */
export const getRatingBreakdown = (userId?: string): RatingBreakdown => {
  const rating = getUserRating();
  const streak = getUserStreak(userId);

  const base = 1000;
  
  // Quiz performance (based on recent quizzes)
  const recentQuizzes = rating.history.slice(-10);
  const quizPerformance = recentQuizzes.reduce((sum, h) => sum + h.change, 0);

  // Accuracy bonus (based on subject ratings)
  const avgAccuracy =
    rating.subjectRatings.length > 0
      ? rating.subjectRatings.reduce((sum, sr) => sum + sr.accuracy, 0) /
        rating.subjectRatings.length
      : 0;
  const accuracyBonus = Math.round(avgAccuracy * 200);

  // Streak bonus
  const streakBonus = Math.min(streak.currentStreak * 2, 100);

  // Consistency bonus (based on total active days)
  const consistencyBonus = Math.min(streak.totalActiveDays, 100);

  // Penalty (negative changes)
  const penalty = recentQuizzes
    .filter((h) => h.change < 0)
    .reduce((sum, h) => sum + h.change, 0);

  const total = base + quizPerformance + accuracyBonus + streakBonus + consistencyBonus + penalty;

  return {
    base,
    quizPerformance: Math.max(0, quizPerformance),
    accuracyBonus,
    streakBonus,
    consistencyBonus,
    penalty: Math.abs(penalty),
    total: Math.max(0, total),
  };
};

/**
 * Get rating milestones
 */
export const getRatingMilestones = (): RatingMilestone[] => {
  const rating = getUserRating();
  const current = rating.current;

  const milestones: RatingMilestone[] = [
    {
      rating: 500,
      title: "Beginner",
      description: "Just getting started",
      isAchieved: current >= 500,
      progress: Math.min((current / 500) * 100, 100),
    },
    {
      rating: 1000,
      title: "Intermediate",
      description: "Building solid foundation",
      isAchieved: current >= 1000,
      progress: Math.min((current / 1000) * 100, 100),
    },
    {
      rating: 1500,
      title: "Advanced",
      description: "Strong understanding",
      isAchieved: current >= 1500,
      progress: Math.min((current / 1500) * 100, 100),
    },
    {
      rating: 2000,
      title: "Expert",
      description: "Mastery level",
      isAchieved: current >= 2000,
      progress: Math.min((current / 2000) * 100, 100),
    },
    {
      rating: 2500,
      title: "Master",
      description: "Elite performer",
      isAchieved: current >= 2500,
      progress: Math.min((current / 2500) * 100, 100),
    },
  ];

  return milestones;
};

/**
 * Get personalized improvement tips
 */
export const getImprovementTips = (userId?: string): string[] => {
  const rating = getUserRating();
  const streak = getUserStreak(userId);
  const current = rating.current;
  const tips: string[] = [];

  // Rating-based tips
  if (current < 1000) {
    tips.push("Complete more quizzes to establish your baseline rating");
    tips.push("Focus on accuracy over speed in the beginning");
    tips.push("Start with Easy difficulty questions to build confidence");
  } else if (current < 1500) {
    tips.push("Challenge yourself with Medium difficulty questions");
    tips.push("Maintain consistency: Take 2-3 quizzes daily");
    tips.push("Review incorrect answers to learn from mistakes");
  } else if (current < 2000) {
    tips.push("Attempt Hard difficulty questions regularly");
    tips.push("Focus on your weak subjects to become well-rounded");
    tips.push("Compete in timed contests to improve speed");
  } else {
    tips.push("Challenge yourself with the hardest questions");
    tips.push("Help others by creating educational content");
    tips.push("Maintain your streak to keep the momentum");
  }

  // Streak-based tips
  if (streak.currentStreak === 0) {
    tips.push("Start a study streak today to boost your rating");
  } else if (streak.currentStreak < 7) {
    tips.push(`Keep your ${streak.currentStreak}-day streak going!`);
  }

  // Subject-based tips
  if (rating.subjectRatings.length > 0) {
    const weakestSubject = rating.subjectRatings.reduce((min, sr) =>
      sr.rating < min.rating ? sr : min
    );
    tips.push(`Improve your ${weakestSubject.subject} skills - it's your weakest area`);
  }

  // Trend-based tips
  if (rating.trend === "declining") {
    tips.push("Your rating is declining. Take a break and come back refreshed");
    tips.push("Review fundamentals before attempting more quizzes");
  }

  return tips.slice(0, 5); // Return top 5 tips
};

/**
 * Get rating statistics
 */
export const getRatingStats = () => {
  const rating = getUserRating();

  // Calculate average change
  const recentChanges = rating.history.slice(-30).map((h) => h.change);
  const avgChange =
    recentChanges.length > 0
      ? recentChanges.reduce((sum, c) => sum + c, 0) / recentChanges.length
      : 0;

  // Calculate best/worst day
  const bestDay = rating.history.reduce((max, h) =>
    h.change > max.change ? h : max
  );
  const worstDay = rating.history.reduce((min, h) =>
    h.change < min.change ? h : min
  );

  return {
    current: rating.current,
    peak: rating.peak,
    trend: rating.trend,
    avgChange: Math.round(avgChange * 10) / 10,
    bestDay,
    worstDay,
    totalQuizzes: rating.history.length - 1, // Exclude initial rating
  };
};
