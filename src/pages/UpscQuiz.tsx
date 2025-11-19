import { useEffect } from "react";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizTaking } from "@/components/quiz/QuizTaking";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { useQuiz } from "@/contexts/QuizContext";
import { buildCalibrationQuiz, buildAdaptiveQuiz, getCategory, getRating, ratingChangeFromPerformance, setRating, analyzePerformance, calibrationAssignment } from "@/hooks/lib/adaptive";
import { getUpscQuestionsBySubject, getUpscQuestionsByTopic, upscQuestionBank, upscSubjects } from "@/data/upscQuestionBank";
import { addQuizAttempt, updateStreak, checkAndAwardBadges, getQuizHistory } from "@/hooks/lib/gamification";
import { recordActivity } from "@/hooks/lib/streakUtils";
import { checkAndAwardBadges as checkNewBadges } from "@/hooks/lib/badgeUtils";
import { updateRatingAfterQuiz } from "@/hooks/lib/ratingUtils";
import { getUserStreak } from "@/hooks/lib/streakUtils";
import { getUserRating } from "@/hooks/lib/ratingUtils";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuizCategory } from "@/hooks/lib/firebaseUserService";

type QuizStage = 'start' | 'taking' | 'results';

const UpscQuiz = () => {
  const { user } = useAuth();
  const { quizState, startQuizWithQuestions, selectAnswer, nextQuestion, previousQuestion, submitQuiz, resetQuiz } = useQuiz();

  const stage: QuizStage = !quizState ? 'start' : quizState.isCompleted ? 'results' : 'taking';

  // Ensure fresh start when visiting the quiz page after completion
  useEffect(() => {
    if (quizState?.isCompleted) {
      resetQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quizState?.isCompleted && quizState.questions?.length) {
      (async () => {
        const questionsAny = quizState.questions as any;
        const perf = analyzePerformance(questionsAny, quizState.answers.map(a => ({ selectedAnswer: a.selectedAnswer, timeTakenSec: a.timeTakenSec })));
        const subject = quizState.subject;
        
        if (quizState.mode === 'calibration') {
          const cat = calibrationAssignment(perf.correct);
          const initialMap: Record<string, number> = { Low: 100, Medium: 300, Best: 600 };
          setRating('upsc', initialMap[cat], subject);
          if (user?.id) await saveQuizCategory(user.id, 'upsc', cat);
        } else {
          const delta = ratingChangeFromPerformance((perf.correct / perf.total) * 100);
          const currentRating = getRating('upsc', subject);
          setRating('upsc', currentRating + delta, subject);
          const cat = getCategory('upsc', subject);
          if (user?.id) await saveQuizCategory(user.id, 'upsc', cat);
        }
      
      // Gamification: Track quiz attempt
      const totalTime = quizState.answers.reduce((sum, a) => sum + (a.timeTakenSec || 0), 0);
      const quizAttempt = addQuizAttempt({
        subject: subject || 'general',
        quizType: quizState.quizType,
        score: perf.correct,
        totalQuestions: perf.total,
        accuracy: Math.round((perf.correct / perf.total) * 100),
        category: getCategory('upsc', subject),
        rating: getRating('upsc', subject),
        timeTaken: totalTime,
        difficulty: quizState.mode === 'calibration' ? 'Mixed' : 'Adaptive',
      });
      
      // Update OLD streak system
      const streakData = updateStreak();
      
      // Check and award badges (OLD system)
      const quizHistory = getQuizHistory();
      const newBadges = checkAndAwardBadges(quizAttempt, streakData, quizHistory);
      
      // Show badge notification if any earned
      if (newBadges.length > 0) {
        console.log('New badges earned:', newBadges);
      }
      
      // UPDATE NEW GAMIFICATION SYSTEM
      // Record activity in new streak system
      if (user?.id) {
        recordActivity('quiz', Math.floor(totalTime / 60), user.id);
      }
      
        // Update rating in new system
        const difficulty = quizState.mode === 'calibration' ? 'medium' : 
          (perf.correct / perf.total) >= 0.8 ? 'hard' : 
          (perf.correct / perf.total) >= 0.5 ? 'medium' : 'easy';
        updateRatingAfterQuiz(
          perf.correct,
          perf.total,
          subject || 'general',
          difficulty as 'easy' | 'medium' | 'hard',
          totalTime
        );
        
        // Check badge progress in new system
        const newStreak = getUserStreak(user?.id);
        const newRating = getUserRating();
        checkNewBadges({
          streak: newStreak,
          rating: newRating
        });
      })();
    }
  }, [quizState?.isCompleted]);

  const handleStart = (quizType: 'topic' | 'subject' | 'full', duration: number, subject?: string, topic?: string) => {
    let questionPool;
    let targetCount;
    let category;
    
    // Get questions based on quiz type
    if (quizType === 'full') {
      // Full syllabus: use all questions from all subjects
      questionPool = upscQuestionBank;
      targetCount = 15;
      category = getCategory('upsc'); // Use default category
    } else if (quizType === 'topic' && topic && subject) {
      questionPool = getUpscQuestionsByTopic(subject, topic);
      // Adjust target count based on available questions in this topic
      // If topic has fewer than 6 questions, use what's available, otherwise use 6
      targetCount = Math.max(Math.min(6, questionPool.length), 3); // Minimum 3 questions even if fewer available
      category = getCategory('upsc', subject);
    } else if (subject) {
      questionPool = getUpscQuestionsBySubject(subject);
      targetCount = 12;
      category = getCategory('upsc', subject);
    } else {
      return; // Invalid state
    }
    
    // Build adaptive quiz from the pool
    const questions = buildAdaptiveQuiz(questionPool as any, category, Math.min(targetCount, questionPool.length));
    
    startQuizWithQuestions({ 
      examName: 'upsc', 
      quizType, 
      questions: questions as any, 
      durationMin: duration, 
      mode: 'adaptive', 
      subject 
    });
  };

  const handleCalibrationStart = (duration: number, subject: string) => {
    const questionPool = getUpscQuestionsBySubject(subject);
    const questions = buildCalibrationQuiz(questionPool as any);
    
    startQuizWithQuestions({ 
      examName: 'upsc', 
      quizType: 'subject', 
      questions: questions as any, 
      durationMin: duration, 
      mode: 'calibration', 
      subject 
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState) {
      selectAnswer(quizState.currentQuestion, answerIndex);
    }
  };

  const handleNext = () => {
    if (quizState && quizState.currentQuestion < quizState.answers.length - 1) {
      nextQuestion();
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleSubmit = () => {
    submitQuiz();
  };

  const handleRestart = () => {
    resetQuiz();
  };

  if (stage === 'start') {
    return <QuizStart onStart={handleStart} examName="UPSC" subjects={upscSubjects} getTopicsBySubject={(subjectId) => {
      const subject = upscSubjects.find(s => s.id === subjectId);
      return subject?.topics || [];
    }} />;
  }

  if (stage === 'results' && quizState && quizState.questions?.length) {
    const questions = quizState.questions;
    const answers = quizState.answers.map((ans, idx) => {
      const question = questions[idx];
      return {
        questionId: idx,
        selectedAnswer: ans?.selectedAnswer ?? -1,
        isCorrect: question ? ans?.selectedAnswer === question.correctAnswer : false,
        timeTakenSec: ans?.timeTakenSec ?? 0
      };
    });
    return <QuizResults answers={answers} onRestart={handleRestart} />;
  }

  if (!quizState) return null;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <QuizTaking
              currentQuestion={quizState.currentQuestion}
              selectedAnswer={quizState.answers[quizState.currentQuestion].selectedAnswer}
              timeLeft={quizState.timeLeft}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
          <div className="lg:col-span-1">
            <QuizNavigation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpscQuiz;
