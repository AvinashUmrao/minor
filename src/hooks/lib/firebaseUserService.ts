import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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
  
  // Activity tracking
  activeDays: number; // Count of unique login days
  lastActiveDate: string; // Date string (YYYY-MM-DD) of last login
  
  // Streak tracking (quiz completion streaks)
  currentStreak: number; // Consecutive days with at least 1 quiz completed
  longestStreak: number; // Best streak achieved
  lastQuizDate: string; // Date string (YYYY-MM-DD) of last quiz completion
  
  // Badges
  earnedBadges: string[]; // Array of badge IDs
  
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
  const today = new Date().toISOString().split('T')[0];
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
    activeDays: 1, // First login counts as 1 active day
    lastActiveDate: today, // Track today as first active date
    currentStreak: 0, // No streak until first quiz
    longestStreak: 0, // No streak achieved yet
    lastQuizDate: '', // No quiz completed yet
    earnedBadges: [], // No badges earned yet
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
  
  const today = new Date().toISOString().split('T')[0];
  const lastQuizDate = profile.lastQuizDate || '';
  
  // Calculate streak update
  let newStreak = profile.currentStreak || 0;
  let newLongest = profile.longestStreak || 0;
  
  // Only update streak if this is a new quiz day
  if (lastQuizDate !== today) {
    if (!lastQuizDate) {
      // First quiz ever
      newStreak = 1;
      newLongest = 1;
    } else {
      const lastQuizDateObj = new Date(lastQuizDate);
      const todayDateObj = new Date(today);
      const dayDiff = Math.floor((todayDateObj.getTime() - lastQuizDateObj.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        // Consecutive day - increase streak
        newStreak = (profile.currentStreak || 0) + 1;
        newLongest = Math.max(profile.longestStreak || 0, newStreak);
      } else if (dayDiff > 1) {
        // Streak broken - reset to 1
        newStreak = 1;
      }
      // dayDiff === 0 shouldn't happen due to check above
    }
  }
  
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
    currentStreak: newStreak, // Update streak
    longestStreak: newLongest, // Update longest streak
    lastQuizDate: today, // Track last quiz date
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
  
  console.log(`Streak updated - Current: ${newStreak}, Longest: ${newLongest}`);
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

/**
 * Get category-specific performance
 */
export interface CategoryPerformance {
  categoryName: string;
  totalQuizzes: number;
  totalQuestionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  rating: number;
  peakRating: number;
  category: StudentCategory;
  subjectPerformance: {
    [subject: string]: {
      quizzesTaken: number;
      accuracy: number;
      correctAnswers: number;
      totalQuestions: number;
      lastAttempted: string;
    };
  };
}

export const getCategoryPerformance = async (
  userId: string,
  examCategory: string
): Promise<CategoryPerformance> => {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return {
        categoryName: examCategory.toUpperCase(),
        totalQuizzes: 0,
        totalQuestionsAttempted: 0,
        correctAnswers: 0,
        accuracy: 0,
        rating: 1200,
        peakRating: 1200,
        category: "average",
        subjectPerformance: {},
      };
    }

    // Get quiz history for this exam category
    const attemptsRef = collection(db, "quizAttempts");
    const q = query(
      attemptsRef,
      where("userId", "==", userId),
      where("examType", "==", examCategory.toLowerCase()),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const attempts = querySnapshot.docs.map(doc => doc.data() as QuizAttempt);

    // Calculate category-specific statistics
    let totalQs = 0;
    let correctQs = 0;
    const subjectStats: { [key: string]: any } = {};

    attempts.forEach((attempt) => {
      totalQs += attempt.totalQuestions;
      correctQs += attempt.score;

      if (!subjectStats[attempt.subject]) {
        subjectStats[attempt.subject] = {
          quizzesTaken: 0,
          accuracy: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          lastAttempted: attempt.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      }

      subjectStats[attempt.subject].quizzesTaken += 1;
      subjectStats[attempt.subject].totalQuestions += attempt.totalQuestions;
      subjectStats[attempt.subject].correctAnswers += attempt.score;
      subjectStats[attempt.subject].accuracy =
        (subjectStats[attempt.subject].correctAnswers /
          subjectStats[attempt.subject].totalQuestions) *
        100;
      subjectStats[attempt.subject].lastAttempted = attempt.timestamp?.toDate?.()?.toISOString() || new Date().toISOString();
    });

    const accuracy = totalQs > 0 ? (correctQs / totalQs) * 100 : 0;
    const categoryRating = profile.currentRating || 1200;
    const peakRating = profile.peakRating || 1200;

    return {
      categoryName: examCategory.toUpperCase(),
      totalQuizzes: attempts.length,
      totalQuestionsAttempted: totalQs,
      correctAnswers: correctQs,
      accuracy,
      rating: categoryRating,
      peakRating,
      category: determineCategory(accuracy, correctQs, totalQs),
      subjectPerformance: subjectStats,
    };
  } catch (error) {
    console.error("Error getting category performance:", error);
    return {
      categoryName: examCategory.toUpperCase(),
      totalQuizzes: 0,
      totalQuestionsAttempted: 0,
      correctAnswers: 0,
      accuracy: 0,
      rating: 1200,
      peakRating: 1200,
      category: "average",
      subjectPerformance: {},
    };
  }
};

/**
 * Quiz Session Interface - stored in Firestore
 */
export interface QuizSession {
  id: string;
  userId: string;
  examName: string;
  quizType: "topic" | "subject" | "full";
  subject?: string;
  topic?: string;
  currentQuestion: number;
  questions: any[];
  answers: Array<{
    questionId: number;
    selectedAnswer: number | null;
    markedForReview: boolean;
    timeTakenSec?: number;
    isCorrect?: boolean;
  }>;
  timeLeft: number;
  isCompleted: boolean;
  mode: "standard" | "calibration" | "adaptive";
  startTime: Timestamp | any;
  lastUpdated: Timestamp | any;
}

/**
 * Save quiz session to Firebase (replaces localStorage)
 */
export const saveQuizSession = async (userId: string, session: Omit<QuizSession, "id">): Promise<string> => {
  try {
    const sessionsRef = collection(db, "users", userId, "quizSessions");
    
    // Check if session exists
    const q = query(sessionsRef, where("examName", "==", session.examName), where("quizType", "==", session.quizType));
    const existing = await getDocs(q);
    
    if (existing.docs.length > 0) {
      // Update existing session using setDoc with merge
      const docRef = doc(db, "users", userId, "quizSessions", existing.docs[0].id);
      await setDoc(docRef, {
        ...session,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
      return existing.docs[0].id;
    } else {
      // Create new session
      const newSession = {
        ...session,
        startTime: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };
      const docRef = await addDoc(sessionsRef, newSession);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving quiz session:", error);
    throw error;
  }
};

/**
 * Get active quiz session from Firebase
 */
export const getQuizSession = async (userId: string, examName: string, quizType: string): Promise<QuizSession | null> => {
  try {
    const sessionsRef = collection(db, "users", userId, "quizSessions");
    const q = query(
      sessionsRef,
      where("examName", "==", examName),
      where("quizType", "==", quizType)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as QuizSession;
  } catch (error) {
    console.error("Error getting quiz session:", error);
    return null;
  }
};

/**
 * Delete quiz session from Firebase
 */
export const deleteQuizSession = async (userId: string, examName: string, quizType: string): Promise<void> => {
  try {
    const sessionsRef = collection(db, "users", userId, "quizSessions");
    const q = query(
      sessionsRef,
      where("examName", "==", examName),
      where("quizType", "==", quizType)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      await deleteDoc(doc(db, "users", userId, "quizSessions", snapshot.docs[0].id));
    }
  } catch (error) {
    console.error("Error deleting quiz session:", error);
  }
};

/**
 * Get user badges from Firebase
 */
export const getUserBadges = async (userId: string): Promise<string[]> => {
  try {
    const profile = await getUserProfile(userId);
    return profile?.earnedBadges || [];
  } catch (error) {
    console.error("Error getting badges:", error);
    return [];
  }
};

/**
 * Save earned badges to Firebase
 */
export const saveBadges = async (userId: string, badgeIds: string[]): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      earnedBadges: badgeIds,
    });
    console.log(`Badges saved to Firebase: ${badgeIds.length} badges`);
  } catch (error) {
    console.error("Error saving badges:", error);
    throw error;
  }
};

/**
 * Save user activity for calendar (streak tracking)
 */
export const saveUserActivity = async (userId: string, date: string): Promise<void> => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const q = query(activitiesRef, where("date", "==", date));
    const existing = await getDocs(q);
    
    if (existing.empty) {
      await addDoc(activitiesRef, {
        date,
        timestamp: serverTimestamp(),
        quizzes: 1,
      });
    } else {
      const docRef = doc(db, "users", userId, "activities", existing.docs[0].id);
      const current = existing.docs[0].data();
      await updateDoc(docRef, {
        quizzes: (current.quizzes || 0) + 1,
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error saving activity:", error);
  }
};

/**
 * Get user activities for calendar
 */
export const getUserActivities = async (userId: string, limit: number = 365): Promise<any[]> => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const q = query(activitiesRef, orderBy("date", "desc"), limit as any);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      date: doc.data().date,
      quizzes: doc.data().quizzes || 0,
    }));
  } catch (error) {
    console.error("Error getting activities:", error);
    return [];
  }
};

/**
 * Save adaptive difficulty rating for a subject
 */
export const saveAdaptiveRating = async (userId: string, subject: string, rating: number): Promise<void> => {
  try {
    const ratingsRef = collection(db, "users", userId, "adaptiveRatings");
    const q = query(ratingsRef, where("subject", "==", subject));
    const existing = await getDocs(q);
    
    if (existing.empty) {
      await addDoc(ratingsRef, {
        subject,
        rating: Math.max(0, rating),
        timestamp: serverTimestamp(),
      });
    } else {
      const docRef = doc(db, "users", userId, "adaptiveRatings", existing.docs[0].id);
      await updateDoc(docRef, {
        rating: Math.max(0, rating),
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error saving adaptive rating:", error);
  }
};

/**
 * Get adaptive difficulty rating for a subject
 */
export const getAdaptiveRating = async (userId: string, subject: string): Promise<number> => {
  try {
    const ratingsRef = collection(db, "users", userId, "adaptiveRatings");
    const q = query(ratingsRef, where("subject", "==", subject));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return 0;
    return snapshot.docs[0].data().rating || 0;
  } catch (error) {
    console.error("Error getting adaptive rating:", error);
    return 0;
  }
};

/**
 * Save selected category for a quiz
 */
export const saveQuizCategory = async (userId: string, examType: string, category: string): Promise<void> => {
  try {
    const categoriesRef = collection(db, "users", userId, "quizCategories");
    const q = query(categoriesRef, where("examType", "==", examType));
    const existing = await getDocs(q);
    
    if (existing.empty) {
      await addDoc(categoriesRef, {
        examType,
        category,
        timestamp: serverTimestamp(),
      });
    } else {
      const docRef = doc(db, "users", userId, "quizCategories", existing.docs[0].id);
      await updateDoc(docRef, {
        category,
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error saving quiz category:", error);
  }
};

/**
 * Get selected category for a quiz
 */
export const getQuizCategory = async (userId: string, examType: string): Promise<string> => {
  try {
    const categoriesRef = collection(db, "users", userId, "quizCategories");
    const q = query(categoriesRef, where("examType", "==", examType));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return "";
    return snapshot.docs[0].data().category || "";
  } catch (error) {
    console.error("Error getting quiz category:", error);
    return "";
  }
};
