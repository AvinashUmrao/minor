/**
 * Adaptive Question Selection Algorithm
 * Similar to CodeChef/Codeforces rating-based problem selection
 */

import { Question, Difficulty } from "@/data/questionBank";
import { StudentCategory } from "./firebaseUserService";

export interface AdaptiveConfig {
  rating: number;
  category: StudentCategory;
  recentAccuracy: number;
  totalQuestions: number;
}

/**
 * Get difficulty distribution based on rating (CodeChef/Codeforces style)
 * Rating ranges:
 * - 0-800: Beginner (mostly easy)
 * - 800-1200: Intermediate (balanced)
 * - 1200-1600: Advanced (more medium/hard)
 * - 1600-2000: Expert (mostly hard)
 * - 2000+: Master (all hard)
 */
export const getDifficultyDistribution = (rating: number, recentAccuracy: number): {
  easy: number;
  medium: number;
  hard: number;
} => {
  // Adjust based on recent performance
  const performanceMultiplier = recentAccuracy < 50 ? 0.8 : recentAccuracy > 75 ? 1.2 : 1.0;
  const adjustedRating = rating * performanceMultiplier;

  if (adjustedRating < 800) {
    // Beginner: Focus on easy questions
    return { easy: 0.60, medium: 0.30, hard: 0.10 };
  } else if (adjustedRating < 1200) {
    // Intermediate: Balanced mix
    return { easy: 0.30, medium: 0.50, hard: 0.20 };
  } else if (adjustedRating < 1600) {
    // Advanced: More challenging
    return { easy: 0.15, medium: 0.45, hard: 0.40 };
  } else if (adjustedRating < 2000) {
    // Expert: Mostly hard
    return { easy: 0.05, medium: 0.30, hard: 0.65 };
  } else {
    // Master: All hard
    return { easy: 0.0, medium: 0.20, hard: 0.80 };
  }
};

/**
 * Select questions adaptively based on user's rating and performance
 */
export const selectAdaptiveQuestions = (
  availableQuestions: Question[],
  config: AdaptiveConfig
): Question[] => {
  const { rating, recentAccuracy, totalQuestions } = config;

  // Get difficulty distribution
  const distribution = getDifficultyDistribution(rating, recentAccuracy);

  // Separate questions by difficulty
  const easyQuestions = availableQuestions.filter(q => q.difficulty === 'Easy');
  const mediumQuestions = availableQuestions.filter(q => q.difficulty === 'Medium');
  const hardQuestions = availableQuestions.filter(q => q.difficulty === 'Hard');

  // Calculate number of questions for each difficulty
  const numEasy = Math.round(totalQuestions * distribution.easy);
  const numMedium = Math.round(totalQuestions * distribution.medium);
  const numHard = totalQuestions - numEasy - numMedium; // Remaining goes to hard

  // Select random questions from each difficulty
  const selectedQuestions: Question[] = [];

  // Add easy questions
  const shuffledEasy = [...easyQuestions].sort(() => 0.5 - Math.random());
  selectedQuestions.push(...shuffledEasy.slice(0, Math.min(numEasy, shuffledEasy.length)));

  // Add medium questions
  const shuffledMedium = [...mediumQuestions].sort(() => 0.5 - Math.random());
  selectedQuestions.push(...shuffledMedium.slice(0, Math.min(numMedium, shuffledMedium.length)));

  // Add hard questions
  const shuffledHard = [...hardQuestions].sort(() => 0.5 - Math.random());
  selectedQuestions.push(...shuffledHard.slice(0, Math.min(numHard, shuffledHard.length)));

  // If we don't have enough questions, fill with available ones
  if (selectedQuestions.length < totalQuestions) {
    const remaining = availableQuestions.filter(
      q => !selectedQuestions.find(sq => sq.id === q.id)
    );
    const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
    selectedQuestions.push(
      ...shuffledRemaining.slice(0, totalQuestions - selectedQuestions.length)
    );
  }

  // Shuffle final selection
  return selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
};

/**
 * Calculate rating change based on performance (ELO-like system)
 */
export const calculateAdaptiveRatingChange = (
  currentRating: number,
  accuracy: number,
  difficulty: Difficulty,
  questionsAttempted: number
): number => {
  // Base K-factor (how much rating can change)
  let kFactor = 32;

  // Adjust K-factor based on rating (higher rating = less volatile)
  if (currentRating > 1800) kFactor = 16;
  else if (currentRating > 1400) kFactor = 24;

  // Expected performance based on rating
  let expectedAccuracy = 0.5; // Default 50%

  if (currentRating < 1000) expectedAccuracy = 0.45;
  else if (currentRating < 1400) expectedAccuracy = 0.55;
  else if (currentRating < 1800) expectedAccuracy = 0.65;
  else expectedAccuracy = 0.75;

  // Performance difference
  const performanceDiff = (accuracy / 100) - expectedAccuracy;

  // Base rating change
  let ratingChange = kFactor * performanceDiff;

  // Difficulty multiplier
  const difficultyMultiplier = {
    'Easy': 0.7,
    'Medium': 1.0,
    'Hard': 1.3,
  }[difficulty] || 1.0;

  ratingChange *= difficultyMultiplier;

  // Questions attempted multiplier (more questions = more reliable)
  const questionMultiplier = Math.min(1.0, questionsAttempted / 15);
  ratingChange *= questionMultiplier;

  // Round and cap
  ratingChange = Math.round(ratingChange);
  ratingChange = Math.max(-50, Math.min(50, ratingChange)); // Cap between -50 and +50

  return ratingChange;
};

/**
 * Get recommended difficulty for next quiz
 */
export const getRecommendedDifficulty = (
  rating: number,
  recentAccuracy: number
): string => {
  const distribution = getDifficultyDistribution(rating, recentAccuracy);

  if (distribution.hard >= 0.5) return 'Hard';
  if (distribution.medium >= 0.4) return 'Medium';
  return 'Easy';
};

/**
 * Get performance feedback message
 */
export const getPerformanceFeedback = (
  ratingChange: number,
  newRating: number
): string => {
  if (ratingChange > 30) {
    return "🎉 Outstanding performance! Keep it up!";
  } else if (ratingChange > 15) {
    return "✨ Great job! You're improving steadily.";
  } else if (ratingChange > 0) {
    return "👍 Good work! Small steps lead to big progress.";
  } else if (ratingChange === 0) {
    return "📊 Consistent performance. Try challenging yourself more!";
  } else if (ratingChange > -15) {
    return "💪 Don't worry! Review the concepts and try again.";
  } else {
    return "📚 Take your time to understand the fundamentals better.";
  }
};
