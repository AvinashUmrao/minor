export type Category = 'Low' | 'Medium' | 'Best';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: Difficulty;
  topic?: string;
}

export interface QuizPerformance {
  correct: number;
  total: number;
  accuracyByDifficulty: Record<Difficulty, { correct: number; total: number }>;
  timePerQuestion: number[];
}

// Rating thresholds
export const categoryFromRating = (rating: number): Category => {
  if (rating >= 500) return 'Best';
  if (rating >= 200) return 'Medium';
  return 'Low';
};

export const initialRating = 200; // neutral start -> Medium

export const getRating = (exam: string, subject?: string): number => {
  const key = subject ? `adaptive_rating_${exam}_${subject}` : `adaptive_rating_${exam}`;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : initialRating;
};

export const setRating = (exam: string, rating: number, subject?: string) => {
  const key = subject ? `adaptive_rating_${exam}_${subject}` : `adaptive_rating_${exam}`;
  localStorage.setItem(key, String(Math.max(0, rating)));
};

// Firebase adaptive rating functions
import { getAdaptiveRating, saveAdaptiveRating } from "./firebaseUserService";

/**
 * Get adaptive rating from Firebase (with localStorage fallback)
 * Note: This is async - use in async contexts only
 */
export const getFirebaseRating = async (userId: string | undefined, exam: string, subject?: string): Promise<number> => {
  if (!userId) {
    // Fallback to localStorage for non-authenticated users
    return getRating(exam, subject);
  }
  
  try {
    const rating = await getAdaptiveRating(userId, `${exam}_${subject || 'general'}`);
    return rating || initialRating;
  } catch (error) {
    console.error('Error getting Firebase rating:', error);
    // Fallback to localStorage
    return getRating(exam, subject);
  }
};

/**
 * Save adaptive rating to Firebase (and localStorage for offline)
 * Note: This is async - use in async contexts only
 */
export const setFirebaseRating = async (userId: string | undefined, exam: string, rating: number, subject?: string): Promise<void> => {
  // Always save to localStorage for offline capability
  setRating(exam, rating, subject);
  
  // Save to Firebase if user is authenticated
  if (!userId) return;
  
  try {
    await saveAdaptiveRating(userId, `${exam}_${subject || 'general'}`, rating);
  } catch (error) {
    console.error('Error saving Firebase rating:', error);
  }
};

export const getCategory = (exam: string, subject?: string): Category => categoryFromRating(getRating(exam, subject));

export const calibrationAssignment = (correct: number): Category => {
  if (correct <= 3) return 'Low';
  if (correct <= 6) return 'Medium';
  return 'Best';
};

export const ratingChangeFromPerformance = (percentage: number): number => {
  if (percentage >= 85) return 40; // Excellent
  if (percentage >= 70) return 20; // Good
  if (percentage >= 50) return 0; // Average
  if (percentage >= 30) return -20; // Poor
  return -40; // Very Poor
};

export const buildCalibrationQuiz = (bank: Question[]): Question[] => {
  const easy = bank.filter(q => q.difficulty === 'Easy');
  const med = bank.filter(q => q.difficulty === 'Medium');
  const hard = bank.filter(q => q.difficulty === 'Hard');
  
  const pick = (arr: Question[], n: number) => {
    // Ensure we get exactly n questions, or as many as available
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(n, arr.length));
  };
  
  const picked = [
    ...pick(easy, 3),
    ...pick(med, 3),
    ...pick(hard, 3),
  ];
  
  // If we got fewer than 9 questions, fill remaining from the entire bank
  if (picked.length < 9) {
    const remaining = 9 - picked.length;
    const allAvailable = bank.filter(q => !picked.includes(q));
    const additional = allAvailable
      .sort(() => 0.5 - Math.random())
      .slice(0, remaining);
    picked.push(...additional);
  }
  
  return picked.sort(() => 0.5 - Math.random()).slice(0, 9);
};

export const buildAdaptiveQuiz = (bank: Question[], category: Category, total: number): Question[] => {
  const weights: Record<Category, Record<Difficulty, number>> = {
    Low: { Easy: 0.7, Medium: 0.3, Hard: 0 },
    Medium: { Easy: 0.4, Medium: 0.4, Hard: 0.2 },
    Best: { Easy: 0.1, Medium: 0.3, Hard: 0.6 },
  };
  const target = weights[category];
  
  const pool = {
    Easy: bank.filter(q => q.difficulty === 'Easy'),
    Medium: bank.filter(q => q.difficulty === 'Medium'),
    Hard: bank.filter(q => q.difficulty === 'Hard'),
  } as Record<Difficulty, Question[]>;
  
  let counts: Record<Difficulty, number> = {
    Easy: Math.round(total * target.Easy),
    Medium: Math.round(total * target.Medium),
    Hard: Math.round(total * target.Hard),
  };
  
  // Fix rounding to ensure total matches
  let sum = counts.Easy + counts.Medium + counts.Hard;
  if (sum !== total) {
    const order: Difficulty[] = ['Hard', 'Medium', 'Easy'];
    let diff = total - sum;
    for (const d of order) {
      if (diff === 0) break;
      counts[d] += Math.sign(diff);
      diff -= Math.sign(diff);
    }
  }
  
  // Check if we have enough questions of each difficulty
  // If not, redistribute from other difficulties
  const picked: Record<Difficulty, Question[]> = {
    Easy: [],
    Medium: [],
    Hard: [],
  };
  
  for (const difficulty of ['Hard', 'Medium', 'Easy'] as Difficulty[]) {
    const need = counts[difficulty];
    const available = pool[difficulty].length;
    
    if (available >= need) {
      // We have enough, pick the required number
      picked[difficulty] = pool[difficulty]
        .sort(() => 0.5 - Math.random())
        .slice(0, need);
    } else {
      // We don't have enough, take all available and mark the deficit
      picked[difficulty] = pool[difficulty];
      counts[difficulty] = available;
    }
  }
  
  // Calculate remaining questions needed
  const actualPicked = picked.Easy.length + picked.Medium.length + picked.Hard.length;
  let remaining = total - actualPicked;
  
  // Fill remaining from any available questions (with duplicates or any difficulty)
  if (remaining > 0) {
    const allRemaining = bank
      .filter(q => !picked.Easy.includes(q) && !picked.Medium.includes(q) && !picked.Hard.includes(q))
      .sort(() => 0.5 - Math.random());
    
    // If we still don't have enough, allow picking from already selected (with preference for different ones)
    const source = allRemaining.length > 0 ? allRemaining : bank;
    const additional = source
      .sort(() => 0.5 - Math.random())
      .slice(0, remaining);
    
    picked.Easy.push(...additional);
  }
  
  const result = [
    ...picked.Easy,
    ...picked.Medium,
    ...picked.Hard,
  ].sort(() => 0.5 - Math.random());
  
  // Ensure we return exactly 'total' questions
  return result.slice(0, total);
};

export const analyzePerformance = (questions: Question[], selected: Array<{ selectedAnswer: number | null; timeTakenSec?: number }>): QuizPerformance => {
  const acc: QuizPerformance = {
    correct: 0,
    total: questions.length,
    accuracyByDifficulty: {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 },
    },
    timePerQuestion: [],
  };
  questions.forEach((q, i) => {
    const ans = selected[i];
    const isCorrect = ans?.selectedAnswer === q.correctAnswer;
    if (isCorrect) acc.correct += 1;
    acc.accuracyByDifficulty[q.difficulty].total += 1;
    if (isCorrect) acc.accuracyByDifficulty[q.difficulty].correct += 1;
    acc.timePerQuestion.push(ans?.timeTakenSec ?? 0);
  });
  return acc;
};

export const topicStrengths = (questions: Question[], selected: Array<{ selectedAnswer: number | null }>) => {
  const map = new Map<string, { correct: number; total: number }>();
  questions.forEach((q, i) => {
    const t = q.topic || q.subject;
    if (!map.has(t)) map.set(t, { correct: 0, total: 0 });
    const rec = map.get(t)!;
    rec.total += 1;
    if (selected[i]?.selectedAnswer === q.correctAnswer) rec.correct += 1;
  });
  return Array.from(map.entries()).sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));
};
