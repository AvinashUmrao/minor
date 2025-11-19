import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  saveQuizSession,
  getQuizSession,
  deleteQuizSession,
  getUserProfile,
  saveQuizAttempt,
  determineCategory,
  calculateRatingChange,
  DifficultyLevel,
} from '@/hooks/lib/firebaseUserService';
import { saveUserActivity } from '@/hooks/lib/firebaseUserService';
import { checkAndAwardBadges } from '@/hooks/lib/badgeUtils';

interface QuizAnswer {
  questionId: number;
  selectedAnswer: number | null;
  markedForReview: boolean;
  isCorrect?: boolean;
  timeTakenSec?: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: Difficulty;
  topic?: string;
}

interface QuizState {
  examName: string;
  quizType: 'topic' | 'subject' | 'full';
  currentQuestion: number;
  answers: QuizAnswer[];
  timeLeft: number;
  isCompleted: boolean;
  questions: QuizQuestion[];
  mode: 'standard' | 'calibration' | 'adaptive';
  subject?: string;
}

interface QuizContextType {
  quizState: QuizState | null;
  earnedBadges: string[]; // Newly earned badge IDs to show notifications
  clearEarnedBadges: () => void; // Clear notifications after showing
  startQuiz: (examName: string, quizType: 'topic' | 'subject' | 'full', totalQuestions: number, duration: number) => void;
  startQuizWithQuestions: (params: { examName: string; quizType: 'topic' | 'subject' | 'full'; questions: QuizQuestion[]; durationMin: number; mode?: 'standard' | 'calibration' | 'adaptive'; subject?: string; }) => void;
  selectAnswer: (questionId: number, answerIndex: number) => void;
  markForReview: (questionId: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  saveProgress: () => void;
  loadProgress: (examName: string) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [questionViewTs, setQuestionViewTs] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]); // Store newly earned badges
  const hasProcessedQuizCompletion = useRef(false); // Guard to prevent duplicate Firebase saves

  const clearEarnedBadges = () => {
    setEarnedBadges([]);
  };

  // Initialize or update user progress when user logs in
  useEffect(() => {
    if (user) {
      // User profile is now automatically initialized in AuthContext
      // Just record activity
      const today = new Date().toISOString().split('T')[0];
      saveUserActivity(user.id, today).catch(err => 
        console.error('Error recording activity:', err)
      );
    }
  }, [user]);

  useEffect(() => {
    if (quizState && !quizState.isCompleted) {
      const timer = setInterval(() => {
        setQuizState(prev => {
          if (!prev || prev.timeLeft <= 0) return prev;
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizState?.isCompleted]);

  useEffect(() => {
    if (quizState && quizState.timeLeft === 0 && !quizState.isCompleted) {
      submitQuiz();
    }
  }, [quizState?.timeLeft]);

  const startQuiz = async (examName: string, quizType: 'topic' | 'subject' | 'full', totalQuestions: number, duration: number) => {
    const newState: QuizState = {
      examName,
      quizType,
      currentQuestion: 0,
      answers: Array.from({ length: totalQuestions }, (_, i) => ({
        questionId: i,
        selectedAnswer: null,
        markedForReview: false,
      })),
      timeLeft: duration * 60,
      isCompleted: false,
      questions: [],
      mode: 'standard',
    };
    setQuizState(newState);
    
    // Save to Firebase if user is logged in
    if (user) {
      try {
        await saveQuizSession(user.id, {
          userId: user.id,
          examName,
          quizType,
          currentQuestion: 0,
          questions: [],
          answers: newState.answers,
          timeLeft: duration * 60,
          isCompleted: false,
          mode: 'standard',
          startTime: new Date(),
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error('Error saving quiz session:', error);
      }
    }
    
    // Keep localStorage for offline fallback
    localStorage.setItem(`quiz_${examName}_${quizType}`, JSON.stringify(newState));
    setQuestionViewTs(Date.now());
  };

  const startQuizWithQuestions = async ({ examName, quizType, questions, durationMin, mode = 'standard', subject }: { examName: string; quizType: 'topic' | 'subject' | 'full'; questions: QuizQuestion[]; durationMin: number; mode?: 'standard' | 'calibration' | 'adaptive'; subject?: string; }) => {
    setQuizStartTime(Date.now());
    hasProcessedQuizCompletion.current = false; // Reset guard for new quiz
    const newState: QuizState = {
      examName,
      quizType,
      currentQuestion: 0,
      answers: Array.from({ length: questions.length }, (_, i) => ({
        questionId: i,
        selectedAnswer: null,
        markedForReview: false,
      })),
      timeLeft: durationMin * 60,
      isCompleted: false,
      questions,
      mode,
      subject,
    };
    setQuizState(newState);
    
    // Save to Firebase if user is logged in
    if (user) {
      try {
        await saveQuizSession(user.id, {
          userId: user.id,
          examName,
          quizType,
          subject,
          currentQuestion: 0,
          questions,
          answers: newState.answers,
          timeLeft: durationMin * 60,
          isCompleted: false,
          mode,
          startTime: new Date(),
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error('Error saving quiz session:', error);
      }
    }
    
    // Keep localStorage for offline fallback
    localStorage.setItem(`quiz_${examName}_${quizType}`, JSON.stringify(newState));
    setQuestionViewTs(Date.now());
  };

  const selectAnswer = (questionId: number, answerIndex: number) => {
    setQuizState(prev => {
      if (!prev) return prev;
      const newAnswers = [...prev.answers];
      
      // Capture time for current question if not already set
      let timeTakenSec = newAnswers[questionId]?.timeTakenSec;
      if (questionViewTs && !timeTakenSec) {
        timeTakenSec = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
      }
      
      // Check if answer is correct
      const question = prev.questions[questionId];
      const isCorrect = question ? question.correctAnswer === answerIndex : false;
      
      newAnswers[questionId] = { 
        ...newAnswers[questionId], 
        selectedAnswer: answerIndex,
        isCorrect,
        timeTakenSec 
      };
      
      const newState = { ...prev, answers: newAnswers };
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}`, JSON.stringify(newState));
      return newState;
    });
  };

  const markForReview = (questionId: number) => {
    setQuizState(prev => {
      if (!prev) return prev;
      const newAnswers = [...prev.answers];
      newAnswers[questionId] = { 
        ...newAnswers[questionId], 
        markedForReview: !newAnswers[questionId].markedForReview 
      };
      const newState = { ...prev, answers: newAnswers };
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}`, JSON.stringify(newState));
      return newState;
    });
  };

  const nextQuestion = () => {
    setQuizState(prev => {
      if (!prev || prev.currentQuestion >= prev.answers.length - 1) return prev;
      
      // Save time for current question before moving
      const newAnswers = [...prev.answers];
      const currentIdx = prev.currentQuestion;
      if (questionViewTs && !newAnswers[currentIdx]?.timeTakenSec) {
        const elapsed = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
        newAnswers[currentIdx] = { ...newAnswers[currentIdx], timeTakenSec: elapsed };
      }
      
      const next = { ...prev, currentQuestion: prev.currentQuestion + 1, answers: newAnswers };
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}`, JSON.stringify(next));
      setQuestionViewTs(Date.now());
      return next;
    });
  };

  const previousQuestion = () => {
    setQuizState(prev => {
      if (!prev || prev.currentQuestion <= 0) return prev;
      
      // Save time for current question before moving
      const newAnswers = [...prev.answers];
      const currentIdx = prev.currentQuestion;
      if (questionViewTs && !newAnswers[currentIdx]?.timeTakenSec) {
        const elapsed = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
        newAnswers[currentIdx] = { ...newAnswers[currentIdx], timeTakenSec: elapsed };
      }
      
      const next = { ...prev, currentQuestion: prev.currentQuestion - 1, answers: newAnswers };
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}`, JSON.stringify(next));
      setQuestionViewTs(Date.now());
      return next;
    });
  };

  const goToQuestion = (index: number) => {
    setQuizState(prev => {
      if (!prev) return prev;
      
      // Save time for current question before jumping
      const newAnswers = [...prev.answers];
      const currentIdx = prev.currentQuestion;
      if (questionViewTs && !newAnswers[currentIdx]?.timeTakenSec) {
        const elapsed = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
        newAnswers[currentIdx] = { ...newAnswers[currentIdx], timeTakenSec: elapsed };
      }
      
      const next = { ...prev, currentQuestion: index, answers: newAnswers };
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}`, JSON.stringify(next));
      setQuestionViewTs(Date.now());
      return next;
    });
  };

  const submitQuiz = async () => {
    if (!quizState) return;
    
    // Save time for last question before submitting
    const newAnswers = [...quizState.answers];
    const currentIdx = quizState.currentQuestion;
    if (questionViewTs && !newAnswers[currentIdx]?.timeTakenSec) {
      const elapsed = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
      newAnswers[currentIdx] = { ...newAnswers[currentIdx], timeTakenSec: elapsed };
    }
    
    const newState = { ...quizState, answers: newAnswers, isCompleted: true };
    
    // Update state immediately to show results UI without delay
    localStorage.setItem(`quiz_${quizState.examName}_${quizState.quizType}_completed`, JSON.stringify(newState));
    localStorage.removeItem(`quiz_${quizState.examName}_${quizState.quizType}`);
    setQuizState(newState);
    
    // Record quiz attempt in background (non-blocking)
    // GUARD: Only process once to prevent duplicate Firebase saves
    if (user && quizStartTime && !hasProcessedQuizCompletion.current) {
      hasProcessedQuizCompletion.current = true; // Set guard immediately
      
      const questionsAttempted = newAnswers.filter(a => a.selectedAnswer !== null).length;
      const correctAnswers = newAnswers.filter(a => a.isCorrect).length;
      const accuracy = questionsAttempted > 0 ? (correctAnswers / questionsAttempted) * 100 : 0;
      const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
      
      // Run Firebase operations in background
      (async () => {
        try {
          // Get current user profile from Firebase
          const profile = await getUserProfile(user.id);
          const currentRating = profile?.currentRating || 1000;
          
          // Determine category and calculate rating change
          const category = determineCategory(accuracy, correctAnswers, questionsAttempted);
          const difficulty: DifficultyLevel = quizState.mode === 'calibration' ? 'mixed' : 
            (accuracy >= 80 ? 'hard' : accuracy >= 60 ? 'medium' : 'easy');
          const ratingChange = calculateRatingChange(currentRating, category, accuracy, difficulty);
          
          const today = new Date().toISOString().split('T')[0];
          
          // Run all Firebase operations in parallel for faster completion
          await Promise.all([
            saveQuizAttempt(user.id, {
              examType: quizState.examName,
              subject: quizState.subject || 'general',
              quizType: quizState.quizType,
              score: correctAnswers,
              totalQuestions: questionsAttempted,
              accuracy,
              difficulty,
              timeTaken,
              answers: newAnswers.map((ans, idx) => ({
                questionId: idx,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: quizState.questions[idx]?.correctAnswer || 0,
                isCorrect: ans.isCorrect || false,
                timeTaken: ans.timeTakenSec || 0,
                difficulty: quizState.questions[idx]?.difficulty || 'Medium',
              })),
              ratingChange,
              categoryAtTime: category,
            }),
            saveUserActivity(user.id, today),
            deleteQuizSession(user.id, quizState.examName, quizState.quizType),
          ]);
          
          console.log('Quiz saved to Firebase successfully');
          
          // Check for newly earned badges
          const updatedProfile = await getUserProfile(user.id);
          if (updatedProfile) {
            const newBadges = await checkAndAwardBadges(user.id, {
              totalQuizzes: updatedProfile.totalQuizzes,
              currentStreak: updatedProfile.currentStreak,
              currentRating: updatedProfile.currentRating,
              lastQuizAccuracy: accuracy,
            });
            
            if (newBadges.length > 0) {
              setEarnedBadges(newBadges);
              console.log('🎉 New badges earned:', newBadges);
            }
          }
        } catch (error) {
          console.error('Error recording quiz attempt:', error);
          // Reset guard on error so user can retry
          hasProcessedQuizCompletion.current = false;
        }
      })();
    }
  };

  const resetQuiz = () => {
    if (quizState) {
      localStorage.removeItem(`quiz_${quizState.examName}_${quizState.quizType}`);
      localStorage.removeItem(`quiz_${quizState.examName}_${quizState.quizType}_completed`);
    }
    setQuizState(null);
  };

  const saveProgress = () => {
    if (quizState) {
      localStorage.setItem(`quiz_${quizState.examName}_${quizState.quizType}`, JSON.stringify(quizState));
    }
  };

  const loadProgress = (examName: string): boolean => {
    const saved = localStorage.getItem(`quiz_${examName}_full`);
    if (saved) {
      setQuizState(JSON.parse(saved));
      return true;
    }
    return false;
  };

  return (
    <QuizContext.Provider
      value={{
        quizState,
        earnedBadges,
        clearEarnedBadges,
        startQuiz,
        startQuizWithQuestions,
        selectAnswer,
        markForReview,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        submitQuiz,
        resetQuiz,
        saveProgress,
        loadProgress,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
