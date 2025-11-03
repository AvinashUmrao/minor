// Gamification Type Definitions

// Badge Types
export type BadgeCategory = "achievement" | "performance" | "learning" | "social";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string; // Lucide icon name or emoji
  requirement: string; // Human-readable requirement
  target: number; // Target value to unlock
  color: string; // Badge color theme
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string; // ISO date string
  progress: number;
  isUnlocked: boolean;
}

export interface BadgeProgress {
  badge: Badge;
  progress: number;
  isUnlocked: boolean;
  earnedAt?: string;
}

// Streak Types
export interface StreakData {
  date: string; // YYYY-MM-DD
  activityCount: number;
  quizzesTaken: number;
  minutesStudied: number;
  blogsRead: number;
  blogsCreated: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  activityHistory: StreakData[];
  freezesRemaining: number;
  totalActiveDays: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  thisMonthActiveDays: number;
  averageActivitiesPerDay: number;
}

// Rating Types
export interface RatingHistory {
  date: string; // YYYY-MM-DD
  rating: number;
  change: number;
  reason: string; // e.g., "Quiz completed", "Streak bonus"
}

export interface SubjectRating {
  subject: string;
  rating: number;
  quizzesTaken: number;
  accuracy: number;
  lastAttempted: string;
}

export interface UserRating {
  current: number;
  peak: number;
  history: RatingHistory[];
  subjectRatings: SubjectRating[];
  percentile: number; // Top X%
  trend: "improving" | "declining" | "stable";
}

export interface RatingBreakdown {
  base: number;
  quizPerformance: number;
  accuracyBonus: number;
  streakBonus: number;
  consistencyBonus: number;
  penalty: number;
  total: number;
}

export interface RatingMilestone {
  rating: number;
  title: string;
  description: string;
  isAchieved: boolean;
  progress: number; // 0-100
}

// Activity Types
export type ActivityType = "quiz" | "study" | "blog_read" | "blog_create" | "practice";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  duration?: number; // minutes
  score?: number;
  subject?: string;
  metadata?: Record<string, any>;
}

// User Progress
export interface UserProgress {
  badges: UserBadge[];
  streak: UserStreak;
  rating: UserRating;
  activities: Activity[];
  stats: {
    totalQuizzes: number;
    totalStudyTime: number; // minutes
    totalBlogsRead: number;
    totalBlogsCreated: number;
    averageAccuracy: number;
    favoriteSubject: string;
  };
}

// Leaderboard
export interface LeaderboardEntry {
  userId: string;
  username: string;
  rating: number;
  rank: number;
  badges: number;
  streak: number;
  avatar?: string;
}

export interface Leaderboard {
  type: "rating" | "streak" | "badges";
  period: "weekly" | "monthly" | "alltime";
  entries: LeaderboardEntry[];
  userRank?: number;
}

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "special";
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  reward: {
    type: "badge" | "rating" | "virtual_currency";
    value: string | number;
  };
  isCompleted: boolean;
}

// Notification Types
export interface GamificationNotification {
  id: string;
  type: "badge_earned" | "streak_milestone" | "rating_change" | "challenge_complete";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
}
