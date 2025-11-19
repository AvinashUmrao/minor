import { UserProgress, QuizAttempt, LeaderboardEntry } from '@/types/userProgress';
import { getUserProfile, getUserQuizHistory } from './firebaseUserService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

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
    activeDays: 1, // Count first login
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
    currentStreak: 0, // No streak until first quiz
    longestStreak: 0,
    badges: ['🎓 Beginner'],
    lastUpdated: new Date().toISOString(),
  };
  
  saveUserProgress(progress);
  return progress;
};

/**
 * Get user progress from Firebase (real-time sync across devices)
 * Falls back to localStorage if Firebase is unavailable
 */
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    // Try to fetch from Firebase first
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return getLocalUserProgress(userId);
    }

    // Convert Firebase profile to UserProgress format
    const progress: UserProgress = {
      userId,
      userName: profile.name || 'User',
      email: profile.email,
      activeDays: profile.activeDays || 1, // Use actual activeDays from Firebase
      lastActiveDate: profile.lastActiveDate || profile.lastActive?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
      firstActiveDate: profile.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
      totalQuizzesTaken: profile.totalQuizzes,
      totalQuestionsAttempted: profile.totalQuestionsAttempted,
      correctAnswers: profile.totalCorrectAnswers,
      incorrectAnswers: profile.totalQuestionsAttempted - profile.totalCorrectAnswers,
      currentRating: profile.currentRating,
      highestRating: profile.peakRating,
      lowestRating: Math.min(profile.currentRating, 800), // Conservative estimate
      categoryPerformance: profile.subjectPerformance as any || {}, // Type mismatch between Firebase and localStorage
      currentStreak: profile.currentStreak || 0, // Fetch from Firebase
      longestStreak: profile.longestStreak || 0, // Fetch from Firebase
      badges: [],
      lastUpdated: new Date().toISOString(),
    };

    return progress;
  } catch (error) {
    console.error('Error fetching user progress from Firebase:', error);
    // Fall back to localStorage
    return getLocalUserProgress(userId);
  }
};

/**
 * Get user progress from localStorage (fallback)
 */
export const getLocalUserProgress = (userId: string): UserProgress | null => {
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
 * Update active days (called on login/page visit)
 * Active days = days user logged in, regardless of quiz activity
 */
/**
 * Update active days (called on every login)
 * Tracks unique login days in both Firebase and localStorage
 */
export const updateActiveDays = async (userId: string): Promise<UserProgress | null> => {
  try {
    // Get Firebase profile first (source of truth)
    const profile = await getUserProfile(userId);
    if (!profile) {
      console.error('User profile not found');
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if user was already active today
    if (profile.lastActiveDate === today) {
      console.log('User already logged in today, activeDays unchanged');
      return await getUserProgress(userId);
    }

    // New day - increment active days in Firebase
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activeDays: (profile.activeDays || 0) + 1,
      lastActiveDate: today,
      lastActive: new Date(),
    });

    console.log(`Active days incremented: ${profile.activeDays || 0} -> ${(profile.activeDays || 0) + 1}`);

    // Also update localStorage for consistency
    const progress = await getUserProgress(userId);
    if (progress) {
      progress.activeDays = (profile.activeDays || 0) + 1;
      progress.lastActiveDate = today;
      progress.lastUpdated = new Date().toISOString();
      saveUserProgress(progress);
    }

    return progress;
  } catch (error) {
    console.error('Error updating active days:', error);
    return null;
  }
};

/**
 * Update quiz streak (called only when user completes a quiz)
 * Streak = consecutive days with at least one quiz completed
 * Updates Firebase as source of truth
 */
export const updateQuizStreak = async (userId: string): Promise<UserProgress | null> => {
  try {
    // Get Firebase profile (source of truth)
    const profile = await getUserProfile(userId);
    if (!profile) {
      console.error('User profile not found for streak update');
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastQuizDate = profile.lastQuizDate || '';
    
    // If already gave quiz today, don't update streak again
    if (lastQuizDate === today) {
      console.log('Already completed quiz today, streak unchanged');
      return await getUserProgress(userId);
    }

    let newStreak = profile.currentStreak || 0;
    let newLongest = profile.longestStreak || 0;

    // Calculate day difference
    if (!lastQuizDate) {
      // First quiz ever
      newStreak = 1;
      newLongest = 1;
      console.log('First quiz completed, streak started: 1');
    } else {
      const lastQuizDateObj = new Date(lastQuizDate);
      const todayDateObj = new Date(today);
      const dayDiff = Math.floor((todayDateObj.getTime() - lastQuizDateObj.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        // Consecutive day - increase streak
        newStreak = (profile.currentStreak || 0) + 1;
        newLongest = Math.max(profile.longestStreak || 0, newStreak);
        console.log(`Consecutive quiz day! Streak: ${profile.currentStreak} -> ${newStreak}`);
      } else if (dayDiff === 0) {
        // Same day - shouldn't happen due to check above
        console.log('Same day quiz (skipped by earlier check)');
        return await getUserProgress(userId);
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
        console.log(`Streak broken (${dayDiff} days gap). Reset to 1`);
      }
    }

    // Update Firebase
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastQuizDate: today,
    });

    console.log(`Streak saved to Firebase - Current: ${newStreak}, Longest: ${newLongest}`);

    // Also update localStorage for local tracking
    setLastStreakDate(userId, today);

    // Update localStorage progress
    const progress = await getUserProgress(userId);
    if (progress) {
      progress.currentStreak = newStreak;
      progress.longestStreak = newLongest;
      progress.lastUpdated = new Date().toISOString();
      saveUserProgress(progress);
    }

    return progress;
  } catch (error) {
    console.error('Error updating quiz streak:', error);
    return null;
  }
};

/**
 * Get last date user gave a quiz (for streak calculation)
 */
const getLastStreakDate = (userId: string): string | null => {
  try {
    return localStorage.getItem(`last_streak_date_${userId}`);
  } catch {
    return null;
  }
};

/**
 * Save last date user gave a quiz
 */
const setLastStreakDate = (userId: string, date: string): void => {
  try {
    localStorage.setItem(`last_streak_date_${userId}`, date);
  } catch (error) {
    console.error('Error saving streak date:', error);
  }
};

/**
 * Record activity for calendar (called when quiz is completed)
 * This makes the calendar show green for quiz days
 */
export const recordQuizActivity = (userId: string): void => {
  const today = new Date().toISOString().split('T')[0];
  const key = `activity_calendar_${userId}`;
  
  try {
    const data = localStorage.getItem(key);
    const calendar: { [date: string]: number } = data ? JSON.parse(data) : {};
    
    // Increment quiz count for today
    calendar[today] = (calendar[today] || 0) + 1;
    
    localStorage.setItem(key, JSON.stringify(calendar));
  } catch (error) {
    console.error('Error recording quiz activity:', error);
  }
};

/**
 * Get activity calendar data in StreakData format for last 90 days
 */
export const getActivityCalendar = (userId: string): any[] => {
  try {
    // Read from the user-specific streak system
    const STREAK_STORAGE_KEY = userId ? `learnwise_user_streak_${userId}` : "learnwise_user_streak";
    const streakData = localStorage.getItem(STREAK_STORAGE_KEY);
    
    console.log(`Loading calendar for user: ${userId}, key: ${STREAK_STORAGE_KEY}`);
    console.log(`Streak data found:`, streakData ? 'Yes' : 'No');
    
    if (!streakData) {
      console.log('No streak data found, returning empty calendar');
      // Return empty calendar for last 90 days
      const result: any[] = [];
      const today = new Date();
      
      for (let i = 89; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        result.push({
          date: dateStr,
          activityCount: 0,
          quizzesTaken: 0,
          minutesStudied: 0,
          blogsRead: 0,
          blogsCreated: 0,
        });
      }
      
      return result;
    }
    
    const streak = JSON.parse(streakData);
    const activityHistory = streak.activityHistory || [];
    
    console.log(`Activity history entries: ${activityHistory.length}`);
    console.log(`Sample activities:`, activityHistory.slice(0, 3));
    
    // Create a map of existing activities
    const activityMap: { [date: string]: any } = {};
    activityHistory.forEach((activity: any) => {
      activityMap[activity.date] = activity;
    });
    
    // Generate last 90 days with actual activity data
    const result: any[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const activity = activityMap[dateStr];
      
      result.push({
        date: dateStr,
        activityCount: activity?.activityCount || 0,
        quizzesTaken: activity?.quizzesTaken || 0,
        minutesStudied: activity?.minutesStudied || 0,
        blogsRead: activity?.blogsRead || 0,
        blogsCreated: activity?.blogsCreated || 0,
      });
    }
    
    const activeDays = result.filter(d => d.activityCount > 0).length;
    console.log(`Calendar generated: ${result.length} days, ${activeDays} active days`);
    
    return result;
  } catch (error) {
    console.error('Error getting activity calendar:', error);
    return [];
  }
};

/**
 * Record a quiz attempt (updates local storage only - Firebase is synced separately)
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
  try {
    // Get existing progress (from localStorage fallback)
    const progress = getLocalUserProgress(userId);
    if (!progress) {
      console.warn('User progress not found for recording attempt');
      return;
    }

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

    // Record quiz activity for calendar (makes day green)
    recordQuizActivity(userId);
    
    // Update quiz streak (consecutive quiz days)
    updateQuizStreak(userId);

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
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
  }
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
 * Scans all user progress records and builds leaderboard dynamically
 */
export const getGlobalLeaderboard = (): LeaderboardEntry[] => {
  try {
    const leaderboard: LeaderboardEntry[] = [];
    const leaderboardData = localStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
    
    // First, try to use stored leaderboard if available
    if (leaderboardData) {
      try {
        const stored = JSON.parse(leaderboardData);
        if (Array.isArray(stored) && stored.length > 0) {
          leaderboard.push(...stored);
        }
      } catch (e) {
        console.error("Error parsing stored leaderboard:", e);
      }
    }
    
    // Also scan all user progress records in localStorage to catch any missing users
    for (const key in localStorage) {
      if (key.startsWith(STORAGE_KEYS.USER_PROGRESS)) {
        try {
          const progressData = localStorage.getItem(key);
          if (progressData) {
            const progress: UserProgress = JSON.parse(progressData);
            
            // Check if user already in leaderboard
            const existingIndex = leaderboard.findIndex(e => e.userId === progress.userId);
            
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
              badges: progress.badges || [],
            };
            
            if (existingIndex >= 0) {
              leaderboard[existingIndex] = entry;
            } else {
              leaderboard.push(entry);
            }
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
    }
    
    // Filter out teachers from the leaderboard
    const studentLeaderboard = leaderboard.filter(entry => !isTeacherEmail(entry.email));
    
    // Sort by rating (descending) before assigning ranks
    studentLeaderboard.sort((a, b) => b.rating - a.rating);
    
    // Reassign ranks after filtering and sorting
    studentLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return studentLeaderboard;
  } catch (error) {
    console.error("Error getting global leaderboard:", error);
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
