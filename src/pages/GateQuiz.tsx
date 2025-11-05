import { useEffect } from "react";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizTaking } from "@/components/quiz/QuizTaking";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { useQuiz } from "@/contexts/QuizContext";
import { buildCalibrationQuiz, buildAdaptiveQuiz, getCategory, getRating, ratingChangeFromPerformance, setRating, analyzePerformance, calibrationAssignment } from "@/lib/adaptive";
import { getQuestionsBySubject, getQuestionsByTopic, questionBank } from "@/data/questionBank";
import { addQuizAttempt, updateStreak, checkAndAwardBadges, getQuizHistory } from "@/lib/gamification";
import { recordActivity } from "@/lib/streakUtils";
import { checkAndAwardBadges as checkNewBadges } from "@/lib/badgeUtils";
import { updateRatingAfterQuiz } from "@/lib/ratingUtils";
import { getUserStreak } from "@/lib/streakUtils";
import { getUserRating } from "@/lib/ratingUtils";
import { useFirebaseQuiz } from "@/hooks/useFirebaseQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type QuizStage = 'start' | 'taking' | 'results';

const GateQuiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizState, startQuiz, startQuizWithQuestions, selectAnswer, nextQuestion, previousQuestion, submitQuiz, resetQuiz } = useQuiz();
  const { saveQuizResult, getRecommendedDifficulty } = useFirebaseQuiz();

  const stage: QuizStage = !quizState ? 'start' : quizState.isCompleted ? 'results' : 'taking';

  useEffect(() => {
    if (quizState?.isCompleted && quizState.questions?.length) {
      const questionsAny = quizState.questions as any;
      const perf = analyzePerformance(questionsAny, quizState.answers.map(a => ({ selectedAnswer: a.selectedAnswer, timeTakenSec: a.timeTakenSec })));
      const subject = quizState.subject;
      
      // Handle calibration vs adaptive mode
      if (quizState.mode === 'calibration') {
        const cat = calibrationAssignment(perf.correct);
        const initialMap: Record<string, number> = { Low: 100, Medium: 300, Best: 600 };
        setRating('gate', initialMap[cat], subject);
        const catKey = subject ? `adaptive_category_gate_${subject}` : 'adaptive_category_gate';
        localStorage.setItem(catKey, cat);
      } else {
        const delta = ratingChangeFromPerformance((perf.correct / perf.total) * 100);
        const currentRating = getRating('gate', subject);
        setRating('gate', currentRating + delta, subject);
        const catKey = subject ? `adaptive_category_gate_${subject}` : 'adaptive_category_gate';
        localStorage.setItem(catKey, getCategory('gate', subject));
      }
      
      // Gamification: Track quiz attempt (OLD system)
      const totalTime = quizState.answers.reduce((sum, a) => sum + (a.timeTakenSec || 0), 0);
      const quizAttempt = addQuizAttempt({
        subject: subject || 'general',
        quizType: quizState.quizType,
        score: perf.correct,
        totalQuestions: perf.total,
        accuracy: Math.round((perf.correct / perf.total) * 100),
        category: getCategory('gate', subject),
        rating: getRating('gate', subject),
        timeTaken: totalTime,
        difficulty: quizState.mode === 'calibration' ? 'Mixed' : 'Adaptive',
      });
      
      // Update OLD streak system
      const streakData = updateStreak();
      
      // Check and award badges (OLD system)
      const quizHistory = getQuizHistory();
      const newBadges = checkAndAwardBadges(quizAttempt, streakData, quizHistory);
      
      // UPDATE NEW GAMIFICATION SYSTEM
      // Record activity in new streak system
      recordActivity('quiz', Math.floor(totalTime / 60));
      
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
      const newStreak = getUserStreak();
      const newRating = getUserRating();
      checkNewBadges({
        streak: newStreak,
        rating: newRating
      });
      
      // SAVE TO FIREBASE if user is authenticated
      if (user) {
        const saveToFirebase = async () => {
          try {
            const difficultyLevel = quizState.mode === 'calibration' ? 'mixed' : 
              (perf.correct / perf.total) >= 0.8 ? 'hard' : 
              (perf.correct / perf.total) >= 0.5 ? 'medium' : 'easy';
            
            const result = await saveQuizResult({
              examType: 'gate',
              subject: subject || 'general',
              quizType: quizState.quizType,
              score: perf.correct,
              totalQuestions: perf.total,
              difficulty: difficultyLevel as any,
              timeTaken: totalTime,
              answers: quizState.answers.map((ans, idx) => ({
                questionId: idx,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: questionsAny[idx].correctAnswer,
                isCorrect: ans.selectedAnswer === questionsAny[idx].correctAnswer,
                timeTaken: ans.timeTakenSec || 0,
                difficulty: questionsAny[idx].difficulty,
              })),
            });
            
            if (result) {
              toast({
                title: "Quiz Saved!",
                description: `Category: ${result.category} | Rating: ${result.newRating} (${result.ratingChange > 0 ? '+' : ''}${result.ratingChange})`,
              });
            }
          } catch (error) {
            console.error('Error saving to Firebase:', error);
            toast({
              title: "Save Failed",
              description: "Could not save quiz to database. Your local progress is still saved.",
              variant: "destructive",
            });
          }
        };
        
        saveToFirebase();
      }
    }
  }, [quizState?.isCompleted, user, saveQuizResult, toast]);

  const handleStart = async (quizType: 'topic' | 'subject' | 'full', duration: number, subject?: string, topic?: string) => {
    let questionPool;
    let targetCount;
    let category;
    
    // Get questions based on quiz type
    if (quizType === 'full') {
      // Full syllabus: use all questions from all subjects
      questionPool = questionBank;
      targetCount = 15;
      category = getCategory('gate'); // Use default category
      
      // Use Firebase recommended difficulty if available
      if (user) {
        const recommended = await getRecommendedDifficulty();
        if (recommended) {
          // Build custom adaptive quiz based on Firebase recommendations
          const questions = buildAdaptiveQuiz(questionPool as any, category, Math.min(targetCount, questionPool.length));
          startQuizWithQuestions({ 
            examName: 'gate', 
            quizType, 
            questions: questions as any, 
            durationMin: duration, 
            mode: 'adaptive', 
            subject 
          });
          return;
        }
      }
    } else if (quizType === 'topic' && topic && subject) {
      questionPool = getQuestionsByTopic(subject, topic);
      targetCount = 6;
      category = getCategory('gate', subject);
    } else if (subject) {
      questionPool = getQuestionsBySubject(subject);
      targetCount = 12;
      category = getCategory('gate', subject);
    } else {
      return; // Invalid state
    }
    
    // Build adaptive quiz from the pool
    const questions = buildAdaptiveQuiz(questionPool as any, category, Math.min(targetCount, questionPool.length));
    
    startQuizWithQuestions({ 
      examName: 'gate', 
      quizType, 
      questions: questions as any, 
      durationMin: duration, 
      mode: 'adaptive', 
      subject 
    });
  };

  const handleCalibrationStart = (duration: number, subject: string) => {
    const questionPool = getQuestionsBySubject(subject);
    const questions = buildCalibrationQuiz(questionPool as any);
    
    startQuizWithQuestions({ 
      examName: 'gate', 
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
    return <QuizStart onStart={handleStart} />;
  }

  if (stage === 'results' && quizState && quizState.questions?.length) {
    const questions = quizState.questions;
    const answers = quizState.answers.map((ans, idx) => ({
      questionId: idx,
      selectedAnswer: ans.selectedAnswer ?? -1,
      isCorrect: ans.selectedAnswer === questions[idx].correctAnswer,
      timeTakenSec: ans.timeTakenSec
    }));
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

export default GateQuiz;
