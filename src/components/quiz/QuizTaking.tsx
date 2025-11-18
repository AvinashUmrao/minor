import { useState } from "react";
import { Clock, ArrowLeft, ArrowRight, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { quizQuestions } from "@/data/sampleData";
import { useQuiz } from "@/contexts/QuizContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface QuizTakingProps {
  currentQuestion: number;
  selectedAnswer: number | null;
  timeLeft: number;
  onAnswerSelect: (answerIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuizTaking = ({
  currentQuestion,
  selectedAnswer,
  timeLeft,
  onAnswerSelect,
  onNext,
  onPrevious
}: QuizTakingProps) => {
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const { quizState, markForReview, resetQuiz } = useQuiz();
  const navigate = useNavigate();
  const questions = quizState?.questions?.length ? quizState.questions : quizQuestions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isMarked = quizState?.answers[currentQuestion]?.markedForReview || false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuitQuiz = () => {
    resetQuiz();
    // Navigate back based on exam type
    const examName = quizState?.examName || 'gate';
    navigate(`/${examName}`);
  };

  return (
    <div>
      {/* Quiz Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4 mr-2" />
                  Quit Quiz
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress will be lost and this quiz attempt will not be saved. You can always start a new quiz later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                  <AlertDialogAction onClick={handleQuitQuiz} className="bg-destructive hover:bg-destructive/90">
                    Yes, Quit Quiz
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

        {/* Question Card */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">{question.subject}</Badge>
              <Badge variant={
                question.difficulty === 'Easy' ? 'success' :
                question.difficulty === 'Medium' ? 'warning' : 'destructive'
              }>
                {question.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      // Toggle functionality: if already selected, deselect; otherwise select
                      if (isSelected) {
                        onAnswerSelect(null as any); // Deselect
                      } else {
                        onAnswerSelect(index); // Select
                      }
                    }}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg border-2 
                      cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                      }
                    `}>
                      {isSelected && (
                        <svg 
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="3" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Explanation removed - will be shown only in results */}
          </CardContent>
        </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant={isMarked ? "warning" : "outline"}
          onClick={() => markForReview(currentQuestion)}
        >
          <Flag className="mr-2 h-4 w-4" />
          {isMarked ? "Unmark" : "Mark for Review"}
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={selectedAnswer === null}
          variant={currentQuestion === questions.length - 1 ? "hero" : "default"}
        >
          {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
