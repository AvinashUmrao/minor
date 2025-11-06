import { UserProgress, QuizAttempt, LeaderboardEntry } from '@/types/userProgress';

const STORAGE_KEYS = {
  USER_PROGRESS: 'user_progress_',
  QUIZ_ATTEMPTS: 'quiz_attempts_',
  GLOBAL_LEADERBOARD: 'global_leaderboard',
};

/**
 * Initialize user progress for a new user
 */
export const initializeUserProgress = (userId: string, userName: string, email: string): UserProgress => {
  const progress: UserProgress = {
    userId,
    userName,
    email,
    activeDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    firstActiveDate: new Date().toISOString().split('T')[0],
    totalQuizzesTaken: 0,
    totalQuestionsAttempted: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentRating: 1200, // Starting rating
    highestRating: 1200,
    lowestRating: 1200,
    categoryPerformance: {},
    currentStreak: 1,
    longestStreak: 1,
    badges: ['🎓 Beginner'],
    lastUpdated: new Date().toISOString(),
  };
  
  saveUserProgress(progress);
  return progress;
};

/**
 * Get user progress from localStorage
 */
export const getUserProgress = (userId: string): UserProgress | null => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.USER_PROGRESS}${userId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Save user progress to localStorage
 */
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.USER_PROGRESS}${progress.userId}`,
      JSON.stringify(progress)
    );
    updateGlobalLeaderboard(progress);
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

/**
 * Update active days and streak
 */
export const updateActiveDays = (userId: string): UserProgress | null => {
  const progress = getUserProgress(userId);
  if (!progress) return null;

  const today = new Date().toISOString().split('T')[0];
  const lastActive = new Date(progress.lastActiveDate);
  const todayDate = new Date(today);
  
  // Check if user was active today already
  if (progress.lastActiveDate === today) {
    return progress;
  }

  // Calculate day difference
  const dayDiff = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff === 1) {
    // Consecutive day - increase streak
    progress.currentStreak += 1;
    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
  } else if (dayDiff > 1) {
    // Streak broken
    progress.currentStreak = 1;
  }

  progress.activeDays += 1;
  progress.lastActiveDate = today;
  progress.lastUpdated = new Date().toISOString();

  saveUserProgress(progress);
  return progress;
};

/**
 * Record activity for calendar
 */
export const recordActivity = (userId: string): void => {
  const today = new Date().toISOString().split('T')[0];
  const key = `activity_calendar_${userId}`;
  
  try {
    const data = localStorage.getItem(key);
    const calendar: { [date: string]: number } = data ? JSON.parse(data) : {};
    
    // Increment activity count for today
    calendar[today] = (calendar[today] || 0) + 1;
    
    localStorage.setItem(key, JSON.stringify(calendar));
  } catch (error) {
    console.error('Error recording activity:', error);
  }
};

/**
 * Get activity calendar data in StreakData format for last 90 days
 */
export const getActivityCalendar = (userId: string): any[] => {
  const key = `activity_calendar_${userId}`;
  
  try {
    const data = localStorage.getItem(key);
    const calendar: { [date: string]: number } = data ? JSON.parse(data) : {};
    
    // Generate last 90 days
    const result: any[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = calendar[dateStr] || 0;
      
      result.push({
        date: dateStr,
        activityCount: count,
        quizzesTaken: count,
        minutesStudied: count * 15,
        blogsRead: 0,
        blogsCreated: 0,
      });
    }
    
    return result;
  } catch {
    return [];
  }
};

/**
 * Record a quiz attempt
 */
export const recordQuizAttempt = (
  userId: string,
  category: string,
  questionsAttempted: number,
  correctAnswers: number,
  ratingBefore: number,
  ratingAfter: number,
  difficulty: 'easy' | 'medium' | 'hard',
  timeTaken: number
): void => {
  const progress = getUserProgress(userId);
  if (!progress) return;

  // Update overall stats
  progress.totalQuizzesTaken += 1;
  progress.totalQuestionsAttempted += questionsAttempted;
  progress.correctAnswers += correctAnswers;
  progress.incorrectAnswers += (questionsAttempted - correctAnswers);
  progress.currentRating = ratingAfter;
  progress.highestRating = Math.max(progress.highestRating, ratingAfter);
  progress.lowestRating = Math.min(progress.lowestRating, ratingAfter);

  // Update category performance
  if (!progress.categoryPerformance[category]) {
    progress.categoryPerformance[category] = {
      quizzesTaken: 0,
      questionsAttempted: 0,
      correctAnswers: 0,
      rating: 1200,
      lastAttempted: new Date().toISOString(),
    };
  }

  const catPerf = progress.categoryPerformance[category];
  catPerf.quizzesTaken += 1;
  catPerf.questionsAttempted += questionsAttempted;
  catPerf.correctAnswers += correctAnswers;
  catPerf.rating = ratingAfter;
  catPerf.lastAttempted = new Date().toISOString();

  // Award badges
  awardBadges(progress);

  // Record activity for calendar
  recordActivity(userId);

  progress.lastUpdated = new Date().toISOString();
  saveUserProgress(progress);

  // Save quiz attempt
  const attempt: QuizAttempt = {
    id: `attempt_${Date.now()}`,
    userId,
    category,
    date: new Date().toISOString(),
    questionsAttempted,
    correctAnswers,
    score: (correctAnswers / questionsAttempted) * 100,
    ratingBefore,
    ratingAfter,
    difficulty,
    timeTaken,
  };

  saveQuizAttempt(attempt);
};

/**
 * Save quiz attempt
 */
const saveQuizAttempt = (attempt: QuizAttempt): void => {
  try {
    const key = `${STORAGE_KEYS.QUIZ_ATTEMPTS}${attempt.userId}`;
    const existing = localStorage.getItem(key);
    const attempts: QuizAttempt[] = existing ? JSON.parse(existing) : [];
    attempts.push(attempt);
    
    // Keep only last 100 attempts
    if (attempts.length > 100) {
      attempts.shift();
    }
    
    localStorage.setItem(key, JSON.stringify(attempts));
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
  }
};

/**
 * Get quiz attempts for a user
 */
export const getQuizAttempts = (userId: string): QuizAttempt[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.QUIZ_ATTEMPTS}${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Award badges based on achievements
 */
const awardBadges = (progress: UserProgress): void => {
  const badges = new Set(progress.badges);

  // Quiz milestones
  if (progress.totalQuizzesTaken >= 5 && !badges.has('🏆 Quiz Starter')) {
    badges.add('🏆 Quiz Starter');
  }
  if (progress.totalQuizzesTaken >= 25 && !badges.has('🎯 Quiz Master')) {
    badges.add('🎯 Quiz Master');
  }
  if (progress.totalQuizzesTaken >= 100 && !badges.has('👑 Quiz Legend')) {
    badges.add('👑 Quiz Legend');
  }

  // Question milestones
  if (progress.totalQuestionsAttempted >= 50 && !badges.has('📚 Learner')) {
    badges.add('📚 Learner');
  }
  if (progress.totalQuestionsAttempted >= 500 && !badges.has('🧠 Scholar')) {
    badges.add('🧠 Scholar');
  }

  // Streak milestones
  if (progress.currentStreak >= 7 && !badges.has('🔥 Week Warrior')) {
    badges.add('🔥 Week Warrior');
  }
  if (progress.currentStreak >= 30 && !badges.has('⚡ Month Master')) {
    badges.add('⚡ Month Master');
  }

  // Rating milestones
  if (progress.currentRating >= 1500 && !badges.has('⭐ Rising Star')) {
    badges.add('⭐ Rising Star');
  }
  if (progress.currentRating >= 1800 && !badges.has('💎 Expert')) {
    badges.add('💎 Expert');
  }
  if (progress.currentRating >= 2100 && !badges.has('🏅 Champion')) {
    badges.add('🏅 Champion');
  }

  // Accuracy badges
  const accuracy = progress.totalQuestionsAttempted > 0
    ? (progress.correctAnswers / progress.totalQuestionsAttempted) * 100
    : 0;
  
  if (accuracy >= 80 && progress.totalQuestionsAttempted >= 50 && !badges.has('🎖️ Accurate')) {
    badges.add('🎖️ Accurate');
  }

  progress.badges = Array.from(badges);
};

/**
 * Get difficulty level based on rating
 */
export const getDifficultyForRating = (rating: number): 'easy' | 'medium' | 'hard' => {
  if (rating < 1300) return 'easy';
  if (rating < 1600) return 'medium';
  return 'hard';
};

/**
 * Calculate adaptive rating change
 */
export const calculateRatingChange = (
  currentRating: number,
  score: number,
  difficulty: 'easy' | 'medium' | 'hard'
): number => {
  const baseChange = 32; // K-factor
  const difficultyMultiplier = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.2,
  };

  const expectedScore = 0.5; // Neutral expectation
  const actualScore = score / 100; // Convert percentage to 0-1
  
  const change = Math.round(
    baseChange * difficultyMultiplier[difficulty] * (actualScore - expectedScore)
  );

  return change;
};

/**
 * Update global leaderboard
 */
const updateGlobalLeaderboard = (progress: UserProgress): void => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
    const leaderboard: LeaderboardEntry[] = data ? JSON.parse(data) : [];

    // Find existing entry
    const existingIndex = leaderboard.findIndex(entry => entry.userId === progress.userId);
    
    const accuracy = progress.totalQuestionsAttempted > 0
      ? (progress.correctAnswers / progress.totalQuestionsAttempted) * 100
      : 0;

    const entry: LeaderboardEntry = {
      userId: progress.userId,
      userName: progress.userName,
      email: progress.email,
      rating: progress.currentRating,
      totalQuizzes: progress.totalQuizzesTaken,
      totalQuestions: progress.totalQuestionsAttempted,
      accuracy: Math.round(accuracy * 10) / 10,
      activeDays: progress.activeDays,
      badges: progress.badges,
    };

    if (existingIndex >= 0) {
      leaderboard[existingIndex] = entry;
    } else {
      leaderboard.push(entry);
    }

    // Sort by rating (descending)
    leaderboard.sort((a, b) => b.rating - a.rating);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    localStorage.setItem(STORAGE_KEYS.GLOBAL_LEADERBOARD, JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

/**
 * Check if email belongs to a teacher
 */
const isTeacherEmail = (email: string): boolean => {
  const authorizedTeachers = [
    "rajesh.kumar@edusmart.edu",
    "priya.sharma@edusmart.edu",
    "amit.patel@edusmart.edu",
    "sneha.gupta@edusmart.edu",
    "vikram.singh@edusmart.edu",
  ];
  
  if (!email) return false;
  return authorizedTeachers.some(
    teacherEmail => teacherEmail.toLowerCase() === email.toLowerCase()
  );
};

/**
 * Get global leaderboard (excludes teachers)
 */
export const getGlobalLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
    const leaderboard: LeaderboardEntry[] = data ? JSON.parse(data) : [];
    
    // Filter out teachers from the leaderboard
    const studentLeaderboard = leaderboard.filter(entry => !isTeacherEmail(entry.email));
    
    // Reassign ranks after filtering
    studentLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return studentLeaderboard;
  } catch {
    return [];
  }
};

/**
 * Get user rank
 */
export const getUserRank = (userId: string): number => {
  const leaderboard = getGlobalLeaderboard();
  const entry = leaderboard.find(e => e.userId === userId);
  return entry?.rank || 0;
};

/**
 * Clear all user data (for testing)
 */
export const clearUserData = (userId: string): void => {
  localStorage.removeItem(`${STORAGE_KEYS.USER_PROGRESS}${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.QUIZ_ATTEMPTS}${userId}`);
  
  // Remove from leaderboard
  const data = localStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
  if (data) {
    const leaderboard: LeaderboardEntry[] = JSON.parse(data);
    const filtered = leaderboard.filter(e => e.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.GLOBAL_LEADERBOARD, JSON.stringify(filtered));
  }
};
