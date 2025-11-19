import { UserStreak, StreakData, StreakStats } from "@/types/gamification";

/**
 * Get storage key for specific user
 */
const getStreakStorageKey = (userId?: string): string => {
  return userId ? `learnwise_user_streak_${userId}` : "learnwise_user_streak";
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Get date N days ago
 */
export const getDateNDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Initialize default streak data
 */
const initializeStreak = (): UserStreak => {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    activityHistory: [],
    freezesRemaining: 1,
    totalActiveDays: 0,
  };
};

/**
 * Get user's streak data from localStorage
 */
export const getUserStreak = (userId?: string): UserStreak => {
  try {
    const stored = localStorage.getItem(getStreakStorageKey(userId));
    if (!stored) return initializeStreak();
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading streak from localStorage:", error);
    return initializeStreak();
  }
};

/**
 * Save user's streak data to localStorage
 */
export const saveUserStreak = (streak: UserStreak, userId?: string): void => {
  try {
    localStorage.setItem(getStreakStorageKey(userId), JSON.stringify(streak));
  } catch (error) {
    console.error("Error saving streak to localStorage:", error);
  }
};

/**
 * Get activity data for a specific date
 */
export const getActivityForDate = (date: string, userId?: string): StreakData | undefined => {
  const streak = getUserStreak(userId);
  return streak.activityHistory.find((activity) => activity.date === date);
};

/**
 * Record activity for today
 */
export const recordActivity = (
  type: "quiz" | "study" | "blog_read" | "blog_create",
  minutes: number = 0,
  userId?: string
): void => {
  const streak = getUserStreak(userId);
  const today = getTodayDate();
  
  console.log(`Recording activity for user: ${userId || 'global'}, type: ${type}, date: ${today}`);
  
  // Find or create today's activity
  let todayActivity = streak.activityHistory.find((a) => a.date === today);
  
  if (!todayActivity) {
    todayActivity = {
      date: today,
      activityCount: 0,
      quizzesTaken: 0,
      minutesStudied: 0,
      blogsRead: 0,
      blogsCreated: 0,
    };
    streak.activityHistory.push(todayActivity);
  }

  // Update activity counts
  todayActivity.activityCount++;
  if (type === "quiz") todayActivity.quizzesTaken++;
  if (type === "study") todayActivity.minutesStudied += minutes;
  if (type === "blog_read") todayActivity.blogsRead++;
  if (type === "blog_create") todayActivity.blogsCreated++;

  console.log(`Activity recorded - Total activities today: ${todayActivity.activityCount}, Quizzes: ${todayActivity.quizzesTaken}`);

  // Update streak
  updateStreak(streak, today);
  
  saveUserStreak(streak, userId);
  console.log(`Streak saved for user: ${userId || 'global'}, current streak: ${streak.currentStreak}`);
};

/**
 * Update streak calculation
 */
const updateStreak = (streak: UserStreak, today: string): void => {
  const lastDate = streak.lastActivityDate;

  if (!lastDate) {
    // First activity ever
    streak.currentStreak = 1;
    streak.longestStreak = 1;
    streak.totalActiveDays = 1;
  } else {
    const daysSinceLastActivity = daysBetween(lastDate, today);

    if (daysSinceLastActivity === 0) {
      // Same day, no change to streak
      return;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day
      streak.currentStreak++;
      streak.totalActiveDays++;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      // Streak broken
      streak.currentStreak = 1;
      streak.totalActiveDays++;
    }
  }

  streak.lastActivityDate = today;
};

/**
 * Use a streak freeze
 */
export const useStreakFreeze = (userId?: string): boolean => {
  const streak = getUserStreak(userId);
  
  if (streak.freezesRemaining <= 0) return false;

  streak.freezesRemaining--;
  // Extend last activity date by 1 day
  const lastDate = new Date(streak.lastActivityDate);
  lastDate.setDate(lastDate.getDate() + 1);
  streak.lastActivityDate = lastDate.toISOString().split("T")[0];

  saveUserStreak(streak, userId);
  return true;
};

/**
 * Get streak statistics
 */
export const getStreakStats = (userId?: string): StreakStats => {
  const streak = getUserStreak(userId);
  const today = getTodayDate();
  const thisMonth = today.substring(0, 7); // YYYY-MM

  // Calculate this month's active days
  const thisMonthActiveDays = streak.activityHistory.filter(
    (a) => a.date.startsWith(thisMonth)
  ).length;

  // Calculate average activities per day
  const totalActivities = streak.activityHistory.reduce(
    (sum, a) => sum + a.activityCount,
    0
  );
  const averageActivitiesPerDay =
    streak.totalActiveDays > 0 ? totalActivities / streak.totalActiveDays : 0;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalActiveDays: streak.totalActiveDays,
    thisMonthActiveDays,
    averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 10) / 10,
  };
};

/**
 * Get activity history for a date range
 */
export const getActivityHistory = (
  startDate: string,
  endDate: string,
  userId?: string
): StreakData[] => {
  const streak = getUserStreak(userId);
  return streak.activityHistory.filter(
    (a) => a.date >= startDate && a.date <= endDate
  );
};

/**
 * Get activity intensity for calendar visualization
 */
export const getActivityIntensity = (activityCount: number): number => {
  if (activityCount === 0) return 0;
  if (activityCount <= 2) return 1;
  if (activityCount <= 5) return 2;
  if (activityCount <= 10) return 3;
  return 4;
};

/**
 * Get calendar data for the last N months
 */
export const getCalendarData = (months: number = 12, userId?: string): StreakData[] => {
  const streak = getUserStreak(userId);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);

  const calendarData: StreakData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const activity = streak.activityHistory.find((a) => a.date === dateStr);

    calendarData.push(
      activity || {
        date: dateStr,
        activityCount: 0,
        quizzesTaken: 0,
        minutesStudied: 0,
        blogsRead: 0,
        blogsCreated: 0,
      }
    );

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendarData;
};

/**
 * Check if streak is at risk (no activity today)
 */
export const isStreakAtRisk = (userId?: string): boolean => {
  const streak = getUserStreak(userId);
  const today = getTodayDate();
  const lastDate = streak.lastActivityDate;

  if (!lastDate) return false;

  const daysSinceLastActivity = daysBetween(lastDate, today);
  return daysSinceLastActivity >= 1 && streak.currentStreak > 0;
};

/**
 * Get streak message
 */
export const getStreakMessage = (userId?: string): string => {
  const streak = getUserStreak(userId);
  const current = streak.currentStreak;

  if (current === 0) {
    return "Start your streak today!";
  } else if (current === 1) {
    return "Great start! Keep it going!";
  } else if (current < 7) {
    return `${current} day streak! Keep pushing!`;
  } else if (current < 30) {
    return `${current} day streak! You're on fire! 🔥`;
  } else if (current < 100) {
    return `${current} day streak! Incredible dedication! 🌟`;
  } else {
    return `${current} day streak! You're a legend! 👑`;
  }
};

/**
 * Initialize sample activity data for demonstration (last 30 days)
 * Call this once to populate the calendar with sample data
 */
export const initializeSampleActivityData = (userId?: string): void => {
  const streak = getUserStreak(userId);
  
  // Only initialize if there's no activity history
  if (streak.activityHistory.length > 0) {
    return;
  }

  const today = new Date();
  const sampleHistory: StreakData[] = [];
  let currentStreakCount = 0;
  let longestStreakCount = 0;
  let totalDays = 0;
  let lastActivityDate = "";

  // Generate activity for the last 30 days with some randomness
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // 70% chance of activity on any given day
    const hasActivity = Math.random() > 0.3;

    if (hasActivity) {
      const activityCount = Math.floor(Math.random() * 5) + 1; // 1-5 activities
      sampleHistory.push({
        date: dateStr,
        activityCount,
        quizzesTaken: Math.floor(Math.random() * 3) + 1, // 1-3 quizzes
        minutesStudied: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
        blogsRead: Math.floor(Math.random() * 3), // 0-2 blogs
        blogsCreated: Math.random() > 0.8 ? 1 : 0, // 20% chance
      });

      // Calculate streak
      if (lastActivityDate === "" || daysBetween(lastActivityDate, dateStr) === 1) {
        currentStreakCount++;
        if (currentStreakCount > longestStreakCount) {
          longestStreakCount = currentStreakCount;
        }
      } else if (daysBetween(lastActivityDate, dateStr) > 1) {
        currentStreakCount = 1;
      }

      lastActivityDate = dateStr;
      totalDays++;
    }
  }

  // Update streak object
  streak.activityHistory = sampleHistory;
  streak.currentStreak = currentStreakCount;
  streak.longestStreak = longestStreakCount;
  streak.totalActiveDays = totalDays;
  streak.lastActivityDate = lastActivityDate;

  saveUserStreak(streak, userId);
  console.log("✅ Sample activity data initialized for the last 30 days");
};
