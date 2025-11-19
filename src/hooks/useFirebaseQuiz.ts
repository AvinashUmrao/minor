import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  initializeUserProfile,
  needsInitialTest,
  saveQuizAttempt,
  getUserQuizHistory,
  getRecentPerformance,
  getNextQuizDifficulty,
  determineCategory,
  calculateRatingChange,
  updateUserStreak,
  updateUserBadges,
  UserProfile,
  QuizAttempt,
  StudentCategory,
  DifficultyLevel,
} from "@/hooks/lib/firebaseUserService";
import { getUserStreak } from "@/hooks/lib/streakUtils";
import { getBadgeStats } from "@/hooks/lib/badgeUtils";

export const useFirebaseQuiz = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);

  // Initialize user profile on mount
  useEffect(() => {
    const initProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await initializeUserProfile(user.id, user.email, user.name);
        setUserProfile(profile);
        
        // Load quiz history
        const history = await getUserQuizHistory(user.id, 20);
        setQuizHistory(history);
      } catch (error) {
        console.error("Error initializing profile:", error);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [user]);

  /**
   * Check if user needs to take initial test
   */
  const checkNeedsInitialTest = async (): Promise<boolean> => {
    if (!user) return true;
    return await needsInitialTest(user.id);
  };

  /**
   * Get recommended difficulty for next quiz
   */
  const getRecommendedDifficulty = async () => {
    if (!user || !userProfile) {
      return { easy: 0.4, medium: 0.4, hard: 0.2 };
    }

    const { averageAccuracy } = await getRecentPerformance(user.id);
    
    return getNextQuizDifficulty(userProfile.currentCategory, averageAccuracy);
  };

  /**
   * Save quiz result to Firebase
   */
  const saveQuizResult = async (quizData: {
    examType: string;
    subject: string;
    quizType: "topic" | "subject" | "full";
    topic?: string;
    score: number;
    totalQuestions: number;
    difficulty: DifficultyLevel;
    timeTaken: number;
    answers: Array<{
      questionId: number;
      selectedAnswer: number | null;
      correctAnswer: number;
      isCorrect: boolean;
      timeTaken: number;
      difficulty: string;
    }>;
  }) => {
    if (!user || !userProfile) {
      console.error("User not authenticated or profile not loaded");
      return null;
    }

    try {
      const accuracy = (quizData.score / quizData.totalQuestions) * 100;
      
      // Determine category
      const category = determineCategory(accuracy, quizData.score, quizData.totalQuestions);
      
      // Calculate rating change using general rating
      const ratingChange = calculateRatingChange(
        userProfile.currentRating,
        category,
        accuracy,
        quizData.difficulty
      );

      // Save to Firebase
      const attemptId = await saveQuizAttempt(user.id, {
        ...quizData,
        accuracy,
        ratingChange,
        categoryAtTime: category,
      });

      // Refresh user profile
      const updatedProfile = await getUserProfile(user.id);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }

      // Update streak in Firebase
      const streakData = getUserStreak(user.id);
      await updateUserStreak(user.id, {
        current: streakData.currentStreak,
        longest: streakData.longestStreak,
      });

      // Update badges in Firebase (pass userId for user-specific data)
      const badgeStats = getBadgeStats(user.id);
      await updateUserBadges(user.id, badgeStats.earned);

      // Refresh quiz history
      const history = await getUserQuizHistory(user.id, 20);
      setQuizHistory(history);

      return {
        attemptId,
        category,
        ratingChange,
        newRating: userProfile.currentRating + ratingChange,
      };
    } catch (error) {
      console.error("Error saving quiz result:", error);
      return null;
    }
  };


  /**
   * Refresh user profile from Firebase
   */
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }
      
      const history = await getUserQuizHistory(user.id, 20);
      setQuizHistory(history);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  return {
    userProfile,
    loading,
    quizHistory,
    checkNeedsInitialTest,
    getRecommendedDifficulty,
    saveQuizResult,
    refreshProfile,
  };
};
