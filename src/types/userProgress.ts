export interface UserProgress {
  userId: string;
  userName: string;
  email: string;
  
  // Activity tracking
  activeDays: number;
  lastActiveDate: string;
  firstActiveDate: string;
  
  // Quiz metrics
  totalQuizzesTaken: number;
  totalQuestionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  
  // Rating & Performance
  currentRating: number;
  highestRating: number;
  lowestRating: number;
  
  // Category-wise performance
  categoryPerformance: {
    [category: string]: {
      quizzesTaken: number;
      questionsAttempted: number;
      correctAnswers: number;
      rating: number;
      lastAttempted: string;
    };
  };
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Badges & Achievements
  badges: string[];
  
  // Last updated
  lastUpdated: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  category: string;
  date: string;
  questionsAttempted: number;
  correctAnswers: number;
  score: number;
  ratingBefore: number;
  ratingAfter: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeTaken: number; // in seconds
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  email: string;
  rating: number;
  totalQuizzes: number;
  totalQuestions: number;
  accuracy: number;
  activeDays: number;
  badges: string[];
  rank?: number;
}
