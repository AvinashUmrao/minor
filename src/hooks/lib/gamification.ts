// Gamification System: Streaks, Badges, Progress Tracking
// Handles all gamification logic for the quiz system

export interface QuizAttempt {
  id: string;
  date: string;
  subject: string;
  quizType: 'topic' | 'subject' | 'full';
  score: number;
  totalQuestions: number;
  accuracy: number;
  category: 'Low' | 'Medium' | 'Best';
  rating: number;
  timeTaken: number;
  difficulty: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate?: string;
  category: 'achievement' | 'streak' | 'accuracy' | 'speed' | 'improvement';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string;
  totalQuizzes: number;
}

export interface StudentProgress {
  userId: string;
  userName: string;
  totalScore: number;
  totalQuizzes: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  quizHistory: QuizAttempt[];
  categoryProgression: {
    Low: number;
    Medium: number;
    Best: number;
  };
}

// ==================== BADGE DEFINITIONS ====================

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'fast-learner',
    name: 'Fast Learner',
    description: 'Complete 5 quizzes in a single day',
    icon: '⚡',
    category: 'achievement',
  },
  {
    id: 'accuracy-king',
    name: 'Accuracy King',
    description: 'Achieve 90%+ accuracy in a quiz',
    icon: '👑',
    category: 'accuracy',
  },
  {
    id: 'accuracy-queen',
    name: 'Accuracy Queen',
    description: 'Achieve 90%+ accuracy in a quiz',
    icon: '👸',
    category: 'accuracy',
  },
  {
    id: 'comeback-champ',
    name: 'Comeback Champ',
    description: 'Improve by 30%+ after a low score',
    icon: '🔥',
    category: 'improvement',
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '🌟',
    category: 'streak',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    category: 'streak',
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'streak',
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get 100% in any quiz',
    icon: '💯',
    category: 'accuracy',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a quiz in under 5 minutes',
    icon: '🚀',
    category: 'speed',
  },
  {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Complete 50 quizzes',
    icon: '📚',
    category: 'achievement',
  },
  {
    id: 'category-climber',
    name: 'Category Climber',
    description: 'Progress from Low to Best category',
    icon: '📈',
    category: 'improvement',
  },
  {
    id: 'consistent-performer',
    name: 'Consistent Performer',
    description: 'Maintain 75%+ accuracy over 10 quizzes',
    icon: '🎯',
    category: 'accuracy',
  },
];

// ==================== STORAGE KEYS ====================

const STORAGE_KEYS = {
  PROGRESS: 'student_progress',
  STREAK: 'student_streak',
  BADGES: 'student_badges',
  QUIZ_HISTORY: 'quiz_history',
  LEADERBOARD: 'leaderboard_data',
};

// ==================== STREAK FUNCTIONS ====================

export const getStreakData = (): StreakData => {
  const stored = localStorage.getItem(STORAGE_KEYS.STREAK);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastQuizDate: '',
    totalQuizzes: 0,
  };
};

export const updateStreak = (): StreakData => {
  const today = new Date().toISOString().split('T')[0];
  const streakData = getStreakData();
  
  if (!streakData.lastQuizDate) {
    // First quiz ever
    streakData.currentStreak = 1;
    streakData.longestStreak = 1;
    streakData.lastQuizDate = today;
    streakData.totalQuizzes = 1;
  } else {
    const lastDate = new Date(streakData.lastQuizDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, just increment quiz count
      streakData.totalQuizzes++;
    } else if (diffDays === 1) {
      // Consecutive day
      streakData.currentStreak++;
      streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
      streakData.lastQuizDate = today;
      streakData.totalQuizzes++;
    } else {
      // Streak broken
      streakData.currentStreak = 1;
      streakData.lastQuizDate = today;
      streakData.totalQuizzes++;
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
  return streakData;
};

// ==================== BADGE FUNCTIONS ====================

export const getEarnedBadges = (): Badge[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const checkAndAwardBadges = (
  quizAttempt: QuizAttempt,
  streakData: StreakData,
  quizHistory: QuizAttempt[]
): Badge[] => {
  const earnedBadges = getEarnedBadges();
  const newBadges: Badge[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Check Fast Learner (5 quizzes in a day)
  const todayQuizzes = quizHistory.filter(q => q.date === today).length;
  if (todayQuizzes >= 5 && !earnedBadges.find(b => b.id === 'fast-learner')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'fast-learner')!, earnedDate: today };
    newBadges.push(badge);
  }
  
  // Check Accuracy King/Queen (90%+ accuracy)
  if (quizAttempt.accuracy >= 90) {
    if (!earnedBadges.find(b => b.id === 'accuracy-king')) {
      const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'accuracy-king')!, earnedDate: today };
      newBadges.push(badge);
    }
  }
  
  // Check Perfect Score (100%)
  if (quizAttempt.accuracy === 100 && !earnedBadges.find(b => b.id === 'perfect-score')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'perfect-score')!, earnedDate: today };
    newBadges.push(badge);
  }
  
  // Check Comeback Champ (30%+ improvement)
  if (quizHistory.length >= 2) {
    const lastTwo = quizHistory.slice(-2);
    const improvement = lastTwo[1].accuracy - lastTwo[0].accuracy;
    if (improvement >= 30 && lastTwo[0].accuracy < 60 && !earnedBadges.find(b => b.id === 'comeback-champ')) {
      const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'comeback-champ')!, earnedDate: today };
      newBadges.push(badge);
    }
  }
  
  // Check Streak Badges
  if (streakData.currentStreak >= 3 && !earnedBadges.find(b => b.id === 'streak-starter')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'streak-starter')!, earnedDate: today };
    newBadges.push(badge);
  }
  if (streakData.currentStreak >= 7 && !earnedBadges.find(b => b.id === 'week-warrior')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'week-warrior')!, earnedDate: today };
    newBadges.push(badge);
  }
  if (streakData.currentStreak >= 30 && !earnedBadges.find(b => b.id === 'month-master')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'month-master')!, earnedDate: today };
    newBadges.push(badge);
  }
  
  // Check Speed Demon (under 5 minutes)
  if (quizAttempt.timeTaken < 300 && !earnedBadges.find(b => b.id === 'speed-demon')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'speed-demon')!, earnedDate: today };
    newBadges.push(badge);
  }
  
  // Check Dedicated Learner (50 quizzes)
  if (quizHistory.length >= 50 && !earnedBadges.find(b => b.id === 'dedicated-learner')) {
    const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'dedicated-learner')!, earnedDate: today };
    newBadges.push(badge);
  }
  
  // Check Consistent Performer (75%+ over 10 quizzes)
  if (quizHistory.length >= 10) {
    const last10 = quizHistory.slice(-10);
    const avgAccuracy = last10.reduce((sum, q) => sum + q.accuracy, 0) / 10;
    if (avgAccuracy >= 75 && !earnedBadges.find(b => b.id === 'consistent-performer')) {
      const badge = { ...BADGE_DEFINITIONS.find(b => b.id === 'consistent-performer')!, earnedDate: today };
      newBadges.push(badge);
    }
  }
  
  // Save new badges
  if (newBadges.length > 0) {
    const allBadges = [...earnedBadges, ...newBadges];
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(allBadges));
  }
  
  return newBadges;
};

// ==================== QUIZ HISTORY FUNCTIONS ====================

export const getQuizHistory = (): QuizAttempt[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const addQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'date'>): QuizAttempt => {
  const history = getQuizHistory();
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: `quiz_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };
  
  history.push(newAttempt);
  localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  
  return newAttempt;
};

// ==================== PROGRESS FUNCTIONS ====================

export const getStudentProgress = (userId: string = 'default_user'): StudentProgress => {
  const quizHistory = getQuizHistory();
  const streakData = getStreakData();
  const badges = getEarnedBadges();
  
  const totalScore = quizHistory.reduce((sum, q) => sum + q.score, 0);
  const totalQuizzes = quizHistory.length;
  const averageAccuracy = totalQuizzes > 0 
    ? quizHistory.reduce((sum, q) => sum + q.accuracy, 0) / totalQuizzes 
    : 0;
  
  const categoryProgression = {
    Low: quizHistory.filter(q => q.category === 'Low').length,
    Medium: quizHistory.filter(q => q.category === 'Medium').length,
    Best: quizHistory.filter(q => q.category === 'Best').length,
  };
  
  return {
    userId,
    userName: 'Student', // Can be customized
    totalScore,
    totalQuizzes,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    badges,
    quizHistory,
    categoryProgression,
  };
};

// ==================== LEADERBOARD FUNCTIONS ====================

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalScore: number;
  averageAccuracy: number;
  totalQuizzes: number;
  currentStreak: number;
  badgeCount: number;
  rank: number;
}

export const getLeaderboard = (sortBy: 'score' | 'accuracy' | 'streak' | 'badges' = 'score'): LeaderboardEntry[] => {
  // In a real app, this would fetch from a backend
  // For now, we'll create mock data + current user
  const currentProgress = getStudentProgress();
  
  const mockUsers: LeaderboardEntry[] = [
    { userId: '1', userName: 'Alex Kumar', totalScore: 2500, averageAccuracy: 88.5, totalQuizzes: 45, currentStreak: 12, badgeCount: 8, rank: 1 },
    { userId: '2', userName: 'Priya Sharma', totalScore: 2300, averageAccuracy: 92.3, totalQuizzes: 38, currentStreak: 8, badgeCount: 7, rank: 2 },
    { userId: '3', userName: 'Rahul Verma', totalScore: 2100, averageAccuracy: 85.7, totalQuizzes: 42, currentStreak: 15, badgeCount: 9, rank: 3 },
    { userId: '4', userName: 'Sneha Patel', totalScore: 1950, averageAccuracy: 90.1, totalQuizzes: 35, currentStreak: 5, badgeCount: 6, rank: 4 },
    { userId: '5', userName: 'Arjun Singh', totalScore: 1800, averageAccuracy: 87.2, totalQuizzes: 40, currentStreak: 10, badgeCount: 7, rank: 5 },
  ];
  
  // Add current user
  const currentUser: LeaderboardEntry = {
    userId: currentProgress.userId,
    userName: 'You',
    totalScore: currentProgress.totalScore,
    averageAccuracy: currentProgress.averageAccuracy,
    totalQuizzes: currentProgress.totalQuizzes,
    currentStreak: currentProgress.currentStreak,
    badgeCount: currentProgress.badges.length,
    rank: 0,
  };
  
  let allUsers = [...mockUsers, currentUser];
  
  // Sort based on criteria
  switch (sortBy) {
    case 'accuracy':
      allUsers.sort((a, b) => b.averageAccuracy - a.averageAccuracy);
      break;
    case 'streak':
      allUsers.sort((a, b) => b.currentStreak - a.currentStreak);
      break;
    case 'badges':
      allUsers.sort((a, b) => b.badgeCount - a.badgeCount);
      break;
    default:
      allUsers.sort((a, b) => b.totalScore - a.totalScore);
  }
  
  // Assign ranks
  allUsers = allUsers.map((user, index) => ({ ...user, rank: index + 1 }));
  
  return allUsers;
};

// ==================== IMPROVEMENT SUGGESTIONS ====================

export const getImprovementSuggestions = (progress: StudentProgress): string[] => {
  const suggestions: string[] = [];
  
  if (progress.averageAccuracy < 70) {
    suggestions.push('Focus on understanding concepts before attempting quizzes');
    suggestions.push('Review incorrect answers to learn from mistakes');
  } else if (progress.averageAccuracy < 85) {
    suggestions.push('Good progress! Try tackling harder difficulty questions');
    suggestions.push('Practice more on topics where you scored lower');
  } else {
    suggestions.push('Excellent performance! Challenge yourself with advanced topics');
    suggestions.push('Help others by sharing your learning strategies');
  }
  
  if (progress.currentStreak === 0) {
    suggestions.push('Start a daily quiz streak to build consistency');
  } else if (progress.currentStreak < 7) {
    suggestions.push(`Great! Keep your ${progress.currentStreak}-day streak going`);
  }
  
  const { Low, Medium, Best } = progress.categoryProgression;
  if (Low > Medium + Best) {
    suggestions.push('Work on improving to reach Medium and Best categories');
  } else if (Best > 0) {
    suggestions.push('Maintain your Best category performance!');
  }
  
  if (progress.totalQuizzes < 10) {
    suggestions.push('Take more quizzes to unlock all features and badges');
  }
  
  return suggestions;
};
