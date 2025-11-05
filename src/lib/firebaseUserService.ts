import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ==================== TYPES ====================

export type StudentCategory = "good" | "average" | "bad";
export type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

export interface QuizAttempt {
  id?: string;
  userId: string;
  examType: string; // 'gate', 'jee', 'cat', etc.
  subject: string;
  quizType: "topic" | "subject" | "full";
  topic?: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  timeTaken: number; // in seconds
  answers: Array<{
    questionId: number;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    timeTaken: number;
    difficulty: string;
  }>;
  timestamp: Timestamp | any;
  ratingChange: number;
  categoryAtTime: StudentCategory;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: Timestamp | any;
  
  // Overall stats
  totalQuizzes: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  
  // Single overall rating
  currentCategory: StudentCategory;
  currentRating: number;
  peakRating: number;
  hasCompletedInitialTest: boolean;
  
  // Subject-wise performance (for tracking only)
  subjectPerformance: {
    [subject: string]: {
      quizzesTaken: number;
      accuracy: number;
      lastAttempted: string;
      totalQuestions: number;
      correctAnswers: number;
    };
  };
  
  lastActive: Timestamp | any;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Determine student category based on performance
 */
export const determineCategory = (accuracy: number, score: number, totalQuestions: number): StudentCategory => {
  // For initial test (mixed difficulty)
  if (totalQuestions >= 9 && totalQuestions <= 15) {
    if (accuracy >= 75 || score >= totalQuestions * 0.75) return "good";
    if (accuracy >= 50 || score >= totalQuestions * 0.5) return "average";
    return "bad";
  }
  
  // For regular tests
  if (accuracy >= 80) return "good";
  if (accuracy >= 60) return "average";
  return "bad";
};

/**
 * Calculate rating change based on performance and category
 */
export const calculateRatingChange = (
  currentRating: number,
  category: StudentCategory,
  accuracy: number,
  difficulty: DifficultyLevel
): number => {
  let baseChange = 0;
  
  // Difficulty multipliers
  const difficultyMultiplier = {
    easy: 10,
    medium: 20,
    hard: 30,
    mixed: 20,
  };
  
  const multiplier = difficultyMultiplier[difficulty];
  
  // Calculate base change
  if (accuracy >= 90) {
    baseChange = multiplier * 1.5;
  } else if (accuracy >= 80) {
    baseChange = multiplier * 1.2;
  } else if (accuracy >= 70) {
    baseChange = multiplier * 1.0;
  } else if (accuracy >= 60) {
    baseChange = multiplier * 0.5;
  } else if (accuracy >= 50) {
    baseChange = 0;
  } else if (accuracy >= 40) {
    baseChange = -multiplier * 0.5;
  } else {
    baseChange = -multiplier * 1.0;
  }
  
  // Category-based adjustments
  if (category === "good" && accuracy < 70) {
    baseChange -= 10; // Penalty for good students performing poorly
  } else if (category === "bad" && accuracy >= 70) {
    baseChange += 15; // Bonus for bad students improving
  }
  
  return Math.round(baseChange);
};

/**
 * Get next quiz difficulty based on category and recent performance
 */
export const getNextQuizDifficulty = (
  category: StudentCategory,
  recentAccuracy?: number
): { easy: number; medium: number; hard: number } => {
  let distribution = { easy: 0.4, medium: 0.4, hard: 0.2 };
  
  // Base distribution by category
  if (category === "good") {
    distribution = { easy: 0.1, medium: 0.3, hard: 0.6 };
  } else if (category === "average") {
    distribution = { easy: 0.3, medium: 0.5, hard: 0.2 };
  } else {
    distribution = { easy: 0.6, medium: 0.3, hard: 0.1 };
  }
  
  // Adjust based on recent performance
  if (recentAccuracy !== undefined) {
    if (recentAccuracy >= 85 && category !== "good") {
      // Increase difficulty if performing well
      distribution.hard += 0.1;
      distribution.easy -= 0.1;
    } else if (recentAccuracy < 50) {
      // Decrease difficulty if struggling
      distribution.easy += 0.1;
      distribution.hard = Math.max(0, distribution.hard - 0.1);
    }
  }
  
  return {
    easy: Math.round(distribution.easy * 100) / 100,
    medium: Math.round(distribution.medium * 100) / 100,
    hard: Math.round(distribution.hard * 100) / 100,
  };
};

/**
 * Initialize rating based on category
 */
const getInitialRating = (category: StudentCategory): number => {
  switch (category) {
    case "good":
      return 1500;
    case "average":
      return 1000;
    case "bad":
      return 600;
    default:
      return 1000;
  }
};

// ==================== FIREBASE OPERATIONS ====================

/**
 * Create or get user profile
 */
export const initializeUserProfile = async (
  userId: string,
  email: string,
  name: string
): Promise<UserProfile> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  
  // Create new user profile
  const newProfile: UserProfile = {
    userId,
    email,
    name,
    createdAt: serverTimestamp(),
    totalQuizzes: 0,
    totalQuestionsAttempted: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    currentCategory: "average",
    currentRating: 1000,
    peakRating: 1000,
    subjectPerformance: {},
    hasCompletedInitialTest: false,
    lastActive: serverTimestamp(),
  };
  
  await setDoc(userRef, newProfile);
  return newProfile;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

/**
 * Check if user needs initial test
 */
export const needsInitialTest = async (userId: string): Promise<boolean> => {
  const profile = await getUserProfile(userId);
  if (!profile) return true;
  
  return !profile.hasCompletedInitialTest;
};

/**
 * Save quiz attempt to Firebase
 */
export const saveQuizAttempt = async (
  userId: string,
  quizData: Omit<QuizAttempt, "id" | "userId" | "timestamp">
): Promise<string> => {
  try {
    const attemptData: Omit<QuizAttempt, "id"> = {
      ...quizData,
      userId,
      timestamp: serverTimestamp(),
    };
    
    const attemptsRef = collection(db, "quizAttempts");
    const docRef = await addDoc(attemptsRef, attemptData);
    
    // Update user profile
    await updateUserProfileAfterQuiz(userId, quizData);
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    throw error;
  }
};

/**
 * Update user profile after quiz completion
 */
const updateUserProfileAfterQuiz = async (
  userId: string,
  quizData: Omit<QuizAttempt, "id" | "userId" | "timestamp">
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error("User profile not found");
  }
  
  const { score, totalQuestions, accuracy, subject, difficulty, ratingChange, categoryAtTime } = quizData;
  
  // Update overall stats
  const newTotalQuestions = profile.totalQuestionsAttempted + totalQuestions;
  const newCorrectAnswers = profile.totalCorrectAnswers + score;
  const newOverallAccuracy = (newCorrectAnswers / newTotalQuestions) * 100;
  
  // Update rating
  const newRating = profile.currentRating + ratingChange;
  const newPeakRating = Math.max(profile.peakRating, newRating);
  
  // Determine new category based on recent performance
  const newCategory = determineCategory(accuracy, score, totalQuestions);
  
  // Update subject performance (tracking only)
  const subjectPerf = profile.subjectPerformance[subject] || {
    quizzesTaken: 0,
    accuracy: 0,
    lastAttempted: new Date().toISOString(),
    totalQuestions: 0,
    correctAnswers: 0,
  };
  
  subjectPerf.quizzesTaken += 1;
  subjectPerf.totalQuestions += totalQuestions;
  subjectPerf.correctAnswers += score;
  subjectPerf.accuracy = (subjectPerf.correctAnswers / subjectPerf.totalQuestions) * 100;
  subjectPerf.lastAttempted = new Date().toISOString();
  
  // Check if this is the initial test
  const isInitialTest = !profile.hasCompletedInitialTest && difficulty === "mixed";
  
  const updates: Partial<UserProfile> = {
    totalQuizzes: profile.totalQuizzes + 1,
    totalQuestionsAttempted: newTotalQuestions,
    totalCorrectAnswers: newCorrectAnswers,
    overallAccuracy: newOverallAccuracy,
    currentRating: newRating,
    peakRating: newPeakRating,
    currentCategory: newCategory,
    subjectPerformance: {
      ...profile.subjectPerformance,
      [subject]: subjectPerf,
    },
    lastActive: serverTimestamp(),
  };
  
  if (isInitialTest) {
    updates.hasCompletedInitialTest = true;
  }
  
  await updateDoc(userRef, updates);
};

/**
 * Get user's quiz history
 */
export const getUserQuizHistory = async (
  userId: string,
  limitCount: number = 20
): Promise<QuizAttempt[]> => {
  try {
    const attemptsRef = collection(db, "quizAttempts");
    const q = query(
      attemptsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const attempts: QuizAttempt[] = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data(),
      } as QuizAttempt);
    });
    
    return attempts;
  } catch (error) {
    console.error("Error getting quiz history:", error);
    return [];
  }
};

/**
 * Get subject-specific quiz history
 */
export const getSubjectQuizHistory = async (
  userId: string,
  subject: string,
  limitCount: number = 10
): Promise<QuizAttempt[]> => {
  try {
    const attemptsRef = collection(db, "quizAttempts");
    const q = query(
      attemptsRef,
      where("userId", "==", userId),
      where("subject", "==", subject),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const attempts: QuizAttempt[] = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data(),
      } as QuizAttempt);
    });
    
    return attempts;
  } catch (error) {
    console.error("Error getting subject quiz history:", error);
    return [];
  }
};

/**
 * Get recent performance for adaptive difficulty
 */
export const getRecentPerformance = async (
  userId: string,
  subject?: string
): Promise<{ averageAccuracy: number; recentCategory: StudentCategory }> => {
  try {
    const attemptsRef = collection(db, "quizAttempts");
    let q;
    
    if (subject) {
      q = query(
        attemptsRef,
        where("userId", "==", userId),
        where("subject", "==", subject),
        orderBy("timestamp", "desc"),
        limit(5)
      );
    } else {
      q = query(
        attemptsRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(5)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { averageAccuracy: 50, recentCategory: "average" };
    }
    
    let totalAccuracy = 0;
    let count = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as QuizAttempt;
      totalAccuracy += data.accuracy;
      count++;
    });
    
    const avgAccuracy = totalAccuracy / count;
    const recentCategory = determineCategory(avgAccuracy, avgAccuracy, 100);
    
    return { averageAccuracy: avgAccuracy, recentCategory };
  } catch (error) {
    console.error("Error getting recent performance:", error);
    return { averageAccuracy: 50, recentCategory: "average" };
  }
};

/**
 * Update streak in Firebase
 */
export const updateUserStreak = async (userId: string, streakData: { current: number; longest: number }): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};

/**
 * Update badges count in Firebase
 */
export const updateUserBadges = async (userId: string, badgeCount: number): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      totalBadges: badgeCount,
    });
  } catch (error) {
    console.error("Error updating badges:", error);
  }
};
