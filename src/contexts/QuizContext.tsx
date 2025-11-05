import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserProgress,
  initializeUserProgress,
  updateActiveDays,
  recordQuizAttempt,
  getDifficultyForRating,
  calculateRatingChange,
} from '@/lib/userProgressService';

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

  // Initialize or update user progress when user logs in
  useEffect(() => {
    if (user) {
      let progress = getUserProgress(user.id);
      if (!progress) {
        progress = initializeUserProgress(user.id, user.name, user.email);
      } else {
        updateActiveDays(user.id);
      }
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

  const startQuiz = (examName: string, quizType: 'topic' | 'subject' | 'full', totalQuestions: number, duration: number) => {
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
    localStorage.setItem(`quiz_${examName}_${quizType}`, JSON.stringify(newState));
    setQuestionViewTs(Date.now());
  };

  const startQuizWithQuestions = ({ examName, quizType, questions, durationMin, mode = 'standard', subject }: { examName: string; quizType: 'topic' | 'subject' | 'full'; questions: QuizQuestion[]; durationMin: number; mode?: 'standard' | 'calibration' | 'adaptive'; subject?: string; }) => {
    setQuizStartTime(Date.now());
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

  const submitQuiz = () => {
    setQuizState(prev => {
      if (!prev) return prev;
      
      // Save time for last question before submitting
      const newAnswers = [...prev.answers];
      const currentIdx = prev.currentQuestion;
      if (questionViewTs && !newAnswers[currentIdx]?.timeTakenSec) {
        const elapsed = Math.max(1, Math.round((Date.now() - questionViewTs) / 1000));
        newAnswers[currentIdx] = { ...newAnswers[currentIdx], timeTakenSec: elapsed };
      }
      
      const newState = { ...prev, answers: newAnswers, isCompleted: true };
      
      // Record quiz attempt if user is logged in
      if (user && quizStartTime) {
        const questionsAttempted = newAnswers.filter(a => a.selectedAnswer !== null).length;
        const correctAnswers = newAnswers.filter(a => a.isCorrect).length;
        const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        
        // Get current rating
        const progress = getUserProgress(user.id);
        const currentRating = progress?.currentRating || 1200;
        
        // Calculate score and rating change
        const score = questionsAttempted > 0 ? (correctAnswers / questionsAttempted) * 100 : 0;
        const difficulty = getDifficultyForRating(currentRating);
        const ratingChange = calculateRatingChange(currentRating, score, difficulty);
        const newRating = Math.max(800, Math.min(2400, currentRating + ratingChange));
        
        // Record the attempt
        recordQuizAttempt(
          user.id,
          prev.examName,
          questionsAttempted,
          correctAnswers,
          currentRating,
          newRating,
          difficulty,
          timeTaken
        );
      }
      
      localStorage.setItem(`quiz_${prev.examName}_${prev.quizType}_completed`, JSON.stringify(newState));
      localStorage.removeItem(`quiz_${prev.examName}_${prev.quizType}`);
      return newState;
    });
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
